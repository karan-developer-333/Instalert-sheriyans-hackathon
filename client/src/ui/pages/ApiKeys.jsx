import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { generateKey, getKey, revokeKey, clearNewKey, clearError } from '../../store/slices/apiKey.slice.js';
import ConfirmDialog from '../components/ConfirmDialog';
import { Skeleton } from '../components/Skeleton';
import { Trash2, Key, Copy, Check, Plus, Loader2 } from 'lucide-react';

const ApiKeys = () => {
  const dispatch = useDispatch();
  const { key, loading, error, newKey } = useSelector((s) => s.apiKey);
  const [copied, setCopied] = useState(false);
  const [confirmRevokeOpen, setConfirmRevokeOpen] = useState(false);

  useEffect(() => {
    dispatch(getKey());
  }, [dispatch]);

  const handleGenerate = () => {
    dispatch(generateKey());
  };

  const handleCopy = (apiKey) => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = () => {
    dispatch(revokeKey());
    setConfirmRevokeOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <Key className="w-6 h-6 text-[#37322F]" />
        <h1 className="text-xl sm:text-2xl font-bold text-[#37322F]">API Key</h1>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {newKey && (
        <div className="bg-yellow-50 border border-yellow-300 p-4 rounded mb-4">
          <p className="font-bold text-yellow-800">Save this key! It won't be shown again.</p>
          <div className="flex items-center gap-2 mt-2">
            <code className="bg-yellow-100 px-3 py-1 rounded text-sm flex-1 break-all">{newKey.apiKey}</code>
            <button onClick={() => handleCopy(newKey.apiKey)} className="p-2 hover:bg-yellow-200 rounded shrink-0">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button onClick={() => dispatch(clearNewKey())} className="mt-2 text-sm text-yellow-700 underline">Dismiss</button>
        </div>
      )}

      <div className="bg-white p-4 sm:p-6 rounded shadow mb-6 border border-[rgba(55,50,47,0.12)]">
        <h2 className="font-semibold mb-3 text-[#37322F]">
          {key ? 'Regenerate API Key' : 'Generate API Key'}
        </h2>
        <p className="text-sm text-[#605A57] mb-3">
          {key
            ? 'This will invalidate the existing key and create a new one.'
            : 'Generate a single API key for your organization to use with instalert-node.'}
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-[#37322F] text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50 hover:bg-[#37322F]/90"
        >
          <Plus className="w-4 h-4" /> {key ? 'Regenerate' : 'Generate'}
        </button>
      </div>

      {key && (
        <div className="bg-white rounded shadow p-4 sm:p-6 border border-[rgba(55,50,47,0.12)]">
          <h2 className="font-semibold mb-3 text-[#37322F]">Current API Key</h2>
          <div className="flex items-center justify-between">
            <div>
              <code className="text-sm text-[#605A57]">{key.preview}</code>
              <p className="text-xs text-[#605A57] mt-1">
                Generated: {new Date(key.generatedAt).toLocaleDateString()}
              </p>
            </div>
            <button onClick={() => setConfirmRevokeOpen(true)} className="text-red-500 hover:bg-red-50 p-2 rounded shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmRevokeOpen}
        onOpenChange={setConfirmRevokeOpen}
        title="Revoke API Key"
        description="Revoke this API key? This action cannot be undone."
        confirmLabel="Revoke"
        onConfirm={handleRevoke}
      />
    </div>
  );
};

export default ApiKeys;
