import http from 'http';
import { Server } from 'socket.io';
import config from '../config/config.js';

import IncidentModel from '../models/incident.model.js';
import MessageModel from '../models/message.model.js';
import OrganizationModel from '../models/organization.model.js';
import Referer from '../models/referer.model.js';
import UserModel from '../models/user.model.js';
import aiScoreService from '../services/aiScore.service.js';
import { sendIncidentNotification } from '../services/email-client.js';

const ALLOWED_ORIGINS = config.ALLOWED_ORIGINS;

let io, server;

const initSocket = (app) => {
  server = http.createServer(app);
  io = new Server(server, {
    cors: {
      origin: ALLOWED_ORIGINS,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] A user connected, socket id: ${socket.id}`);

    socket.on("join-org", (data) => {
      try {
        console.log('[Socket] Raw join-org data:', data);
        const parsed = JSON.parse(data);
        console.log('[Socket] Parsed join-org:', parsed);
        const { joinCode } = parsed;
        socket.join(`org:${joinCode}`);
        socket.joinCode = joinCode;
        console.log(`[Socket] User joined org room: org:${joinCode}`);
        socket.emit('joined-room', { joinCode });
      } catch (err) {
        console.error('[Socket] Error joining org:', err);
      }
    });

    socket.on("create-incident", async (clientData) => {
      try {
        console.log('[Socket] Raw create-incident data:', clientData);
        const data = JSON.parse(clientData);

        let organizationId = data.organizationId;

        if (!organizationId && data.joinCode) {
          console.log('[Socket] organizationId missing, looking up org by joinCode:', data.joinCode);
          const org = await OrganizationModel.findOne({ organizationJoinCode: data.joinCode });
          if (!org) {
            return socket.emit("error", "Organization not found for join code: " + data.joinCode);
          }
          organizationId = org._id;
          console.log('[Socket] Found organization:', org._id, org.organizationName);
        }

        if (!organizationId) {
          return socket.emit("error", "Either organizationId or joinCode is required");
        }

        const newIncident = await IncidentModel.create({
          title: data.title,
          description: data.description,
          organization: organizationId,
        });

        console.log('[Socket] Incident created:', newIncident._id);
        console.log('[Socket] Broadcasting to room: org:', data.joinCode);

        io.to(`org:${data.joinCode}`).emit("receive-incident", newIncident);
        console.log('[Socket] Broadcast complete');

        // Schedule email notification after 10 seconds if no reports submitted
        setTimeout(async () => {
          try {
            const freshIncident = await IncidentModel.findById(newIncident._id);
            if (!freshIncident) return;

            const messageCount = await MessageModel.countDocuments({ incident: freshIncident._id });
            if (messageCount > 0) return;
            if (freshIncident.notifiedAt) return;

            const org = await OrganizationModel.findById(organizationId).populate('owner', 'email');
            const orgReferers = await Referer.find({ organization: organizationId }).populate('referer', 'email');

            const allEmails = [];
            if (org?.owner?.email) allEmails.push(org.owner.email);
            orgReferers.forEach(ref => {
              if (ref.referer?.email && !allEmails.includes(ref.referer.email)) {
                allEmails.push(ref.referer.email);
              }
            });

            for (const email of allEmails) {
              await sendIncidentNotification(email, freshIncident, org.organizationName);
            }

            freshIncident.notifiedAt = new Date();
            await freshIncident.save();
            console.log(`[Socket][Email] Incident notification sent to ${allEmails.length} employees`);
          } catch (err) {
            console.error("[Socket][Email] Error sending incident notification:", err);
          }
        }, 10000);
      } catch (err) {
        console.error("[Socket] Error creating incident:", err);
        socket.emit("error", "Failed to create incident: " + err.message);
      }
    });

    socket.on("update-incident", async (clientData) => {
      try {
        const data = JSON.parse(clientData);
        console.log('[Socket] Updating incident:', data.incidentId, 'with joinCode:', data.joinCode);

        const updatedIncident = await IncidentModel.findByIdAndUpdate(
          data.incidentId,
          {
            title: data.title,
            description: data.description,
            status: data.status
          },
          { new: true }
        );

        if (updatedIncident) {
          console.log('[Socket] Incident updated, broadcasting to:', `org:${data.joinCode}`);
          io.to(`org:${data.joinCode}`).emit("receive-incident", updatedIncident);
        }
      } catch (err) {
        console.error("[Socket] Error updating incident:", err);
        socket.emit("error", "Failed to update incident");
      }
    });

    socket.on("send-message", async (clientData) => {
      try {
        const data = JSON.parse(clientData);
        console.log('[Socket] Message data received:', { incidentId: data.incidentId, userId: data.userId, senderName: data.senderName });

        if (!data.userId) {
          return socket.emit("error", "User ID is required");
        }

        const incident = await IncidentModel.findById(data.incidentId);
        if (!incident) {
          return socket.emit("error", "Incident not found");
        }

        if (incident.status === "closed") {
          return socket.emit("error", "This incident is closed. No more reports can be submitted.");
        }

        const newMessage = await MessageModel.create({
          content: data.message,
          sender: data.userId,
          incident: data.incidentId
        });

        const messageCount = await MessageModel.countDocuments({ incident: data.incidentId });

        if (messageCount === 1 && incident.status === "open") {
          incident.status = "in_progress";
          await incident.save();
          console.log('[Socket] Incident auto-updated to in_progress');

          io.to(`org:${data.joinCode}`).emit("incident-updated", JSON.stringify({
            _id: incident._id,
            status: incident.status,
          }));
        }

        console.log('[Socket] Message saved to DB:', newMessage._id);

        io.to(`org:${data.joinCode}`).emit("receive-message", JSON.stringify({
          _id: newMessage._id,
          content: newMessage.content,
          sender: data.senderName || "Unknown",
          senderId: data.userId,
          tempId: data.tempId,
          incidentId: data.incidentId,
          createdAt: newMessage.createdAt
        }));
      } catch (error) {
        console.error("[Socket] Error sending message:", error);
        socket.emit("error", "Failed to send message");
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected, socket id: ${socket.id}`);
    });

    socket.on("toggle-incident-status", async (clientData) => {
      try {
        const data = JSON.parse(clientData);
        console.log('[Socket] Toggle incident status:', data.incidentId);

        const incident = await IncidentModel.findById(data.incidentId);
        if (!incident) {
          return socket.emit("error", "Incident not found");
        }

        if (incident.status === "closed") {
          incident.status = "open";
        } else {
          incident.status = "closed";
          aiScoreService.scoreIncidentMessages(incident._id);
        }
        await incident.save();

        console.log('[Socket] Incident status toggled to:', incident.status);
        io.to(`org:${data.joinCode}`).emit("incident-updated", JSON.stringify({
          _id: incident._id,
          status: incident.status,
        }));
      } catch (err) {
        console.error("[Socket] Error toggling incident status:", err);
        socket.emit("error", "Failed to toggle incident status");
      }
    });

    socket.on("update-message", async (clientData) => {
      try {
        const data = JSON.parse(clientData);
        console.log('[Socket] Update message:', data.messageId, 'by user:', data.userId);

        if (!data.content || !data.content.trim()) {
          return socket.emit("error", "Content is required");
        }

        const message = await MessageModel.findOne({
          _id: data.messageId,
          incident: data.incidentId,
          sender: data.userId,
        });

        if (!message) {
          return socket.emit("error", "Message not found or you don't have permission to edit it");
        }

        message.ai_score = 0;
        message.content = data.content.trim();
        message.updatedAt = new Date();
        await message.save();

        aiScoreService.recalculateUserScore(data.userId);

        io.to(`org:${data.joinCode}`).emit("message-updated", JSON.stringify({
          _id: message._id,
          content: message.content,
          incidentId: message.incident,
          updatedAt: message.updatedAt,
        }));
      } catch (err) {
        console.error("[Socket] Error updating message:", err);
        socket.emit("error", "Failed to update message");
      }
    });

    socket.on("delete-message", async (clientData) => {
      try {
        const data = JSON.parse(clientData);
        console.log('[Socket] Delete message:', data.messageId, 'by user:', data.userId);

        const message = await MessageModel.findOne({
          _id: data.messageId,
          incident: data.incidentId,
          sender: data.userId,
        });

        if (!message) {
          return socket.emit("error", "Message not found or you don't have permission to delete it");
        }

        aiScoreService.handleMessageScoreDelete(data.messageId);

        io.to(`org:${data.joinCode}`).emit("message-deleted", JSON.stringify({
          _id: data.messageId,
          incidentId: data.incidentId,
        }));
      } catch (err) {
        console.error("[Socket] Error deleting message:", err);
        socket.emit("error", "Failed to delete message");
      }
    });
  });

  return { io, server };
};

export { io, server, initSocket };
