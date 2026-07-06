// src/pages/Backup.jsx
import React, { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DatabaseBackup,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  X,
  RefreshCw,
  History,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { config } from "@/components/CustomComponents/config.js";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

/*
  Backup.jsx
  - Uses APIs:
    POST config.Api + "Backup/runBackup"     -> mongodump, upload to Drive, delete local copy
    POST config.Api + "Backup/listBackups"   -> list backup files in the Drive folder
    POST config.Api + "Backup/restoreBackup" -> download a backup and mongorestore it (destructive)
*/

/* ---------------- Toast provider (self-contained, same pattern as MenuRegistry) ---------------- */
const ToastContext = createContext({});
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toast = ({ title, description, variant = "default" }) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((t) => [...t, { id, title, description, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              className={`pointer-events-auto p-3 rounded-lg shadow-lg border flex justify-between items-start gap-3 ${
                t.variant === "destructive"
                  ? "bg-red-800 text-white"
                  : t.variant === "success"
                  ? "bg-green-800 text-white"
                  : "bg-slate-900 text-white"
              }`}
            >
              <div>
                {t.title && <div className="font-semibold text-sm">{t.title}</div>}
                {t.description && <div className="text-sm opacity-90 mt-1">{t.description}</div>}
              </div>
              <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="text-slate-300">
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
const useToast = () => useContext(ToastContext);

const formatBytes = (bytes) => {
  const n = Number(bytes);
  if (!n) return "-";
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
};

/* ---------------- Restore confirmation dialog ---------------- */
const RestoreConfirmDialog = ({ file, onCancel, onConfirm, loading }) => {
  const [text, setText] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70" onClick={loading ? undefined : onCancel} />
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-50 w-full max-w-md bg-slate-950 border border-red-900 rounded-lg p-6"
      >
        <div className="flex items-center gap-2 text-red-400 font-semibold text-lg">
          <AlertTriangle className="w-5 h-5" /> Restore Database
        </div>
        <p className="text-sm text-slate-300 mt-3">
          This will <span className="font-semibold text-white">replace all current data</span> in the live database
          with the contents of <span className="font-mono text-white">{file?.name}</span>. Anything created or
          changed after this backup was taken will be permanently lost. This cannot be undone.
        </p>
        <p className="text-sm text-slate-400 mt-3">
          Type <span className="font-mono text-white">RESTORE</span> to confirm.
        </p>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
          className="mt-2 h-10 w-full rounded-md px-3 border border-slate-700 bg-slate-900 text-white"
          placeholder="RESTORE"
        />
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-md text-white hover:bg-slate-800 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(text)}
            disabled={loading || text !== "RESTORE"}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            {loading ? "Restoring..." : "Restore"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ---------------- Main Component ---------------- */
function BackupInner() {
  const { toast } = useToast();
  const { getPermissionsByPath } = useAuth();
  const navigate = useNavigate();

  const [Permissions, setPermissions] = useState({ isAdd: false, isView: false, isEdit: false, isDelete: false });
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [restoreTarget, setRestoreTarget] = useState(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    getPermissionsByPath(window.location.pathname).then((res) => {
      if (res) {
        setPermissions(res);
      } else {
        navigate("/dashboard");
      }
    });
  }, []);

  useEffect(() => {
    if (Permissions.isView) fetchHistory();
  }, [Permissions.isView]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(config.Api + "Backup/listBackups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setHistory(data.success ? data.data : []);
      if (!data.success) {
        toast({ title: "Could not load backup history", description: data.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Could not load backup history", description: err.message, variant: "destructive" });
    } finally {
      setHistoryLoading(false);
    }
  };

  const runBackup = async () => {
    setRunning(true);
    setLastResult(null);
    try {
      const res = await fetch(config.Api + "Backup/runBackup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setLastResult(data);
      if (data.success) {
        toast({ title: "Backup complete", description: "Uploaded to Google Drive and the local copy was removed.", variant: "success" });
        fetchHistory();
      } else {
        toast({ title: "Backup failed", description: data.message || "Unknown error", variant: "destructive" });
      }
    } catch (err) {
      setLastResult({ success: false, message: err.message });
      toast({ title: "Backup failed", description: err.message, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  const handleRestore = async (confirmText) => {
    if (!restoreTarget) return;
    setRestoring(true);
    try {
      const res = await fetch(config.Api + "Backup/restoreBackup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: restoreTarget.id, confirm: confirmText }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Restore complete", description: data.message, variant: "success" });
        setRestoreTarget(null);
      } else {
        toast({ title: "Restore failed", description: data.message || "Unknown error", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Restore failed", description: err.message, variant: "destructive" });
    } finally {
      setRestoring(false);
    }
  };

  if (!Permissions.isView) return null;

  return (
    <div className="space-y-6 p-4 min-h-screen bg-slate-950 text-slate-100">
      <h1 className="text-2xl font-bold">Backup</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-fuchsia-600/20 flex items-center justify-center flex-shrink-0">
            <DatabaseBackup className="w-7 h-7 text-fuchsia-400" />
          </div>
          <div>
            <div className="font-semibold text-lg">Database Backup</div>
            <div className="text-sm text-slate-400 mt-1">
              Dumps the entire database to a gzip archive (backup-&lt;date&gt;.gz), uploads it to Google Drive,
              and removes the local copy once the upload succeeds.
            </div>
          </div>
        </div>

        <button
          onClick={runBackup}
          disabled={running || !Permissions.isAdd}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-60 text-white px-4 py-2.5 font-medium transition-colors"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <DatabaseBackup className="w-4 h-4" />}
          {running ? "Backing up..." : "Run Backup Now"}
        </button>

        <AnimatePresence>
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className={`mt-6 rounded-md border p-4 text-sm ${
                lastResult.success ? "border-green-800 bg-green-900/30" : "border-red-800 bg-red-900/30"
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                {lastResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                {lastResult.success ? "Backup uploaded successfully" : "Backup failed"}
              </div>
              <div className="mt-2 text-slate-300">{lastResult.message}</div>
              {lastResult.fileName && <div className="mt-1 text-slate-400">File: {lastResult.fileName}</div>}
              {lastResult.driveLink && (
                <a
                  href={lastResult.driveLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-fuchsia-400 hover:underline"
                >
                  View on Google Drive <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Backup History */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <History className="w-5 h-5 text-fuchsia-400" /> Backup History
          </div>
          <button
            onClick={fetchHistory}
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${historyLoading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        <div className="mt-4">
          {historyLoading && history.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Loading...
            </div>
          ) : history.length === 0 ? (
            <div className="py-8 text-center text-slate-400">No backups found yet.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {history.map((file) => (
                <div key={file.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-sm text-white truncate">{file.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {file.createdTime ? dayjs(file.createdTime).format("DD MMM YYYY, hh:mm A") : "-"} · {formatBytes(file.size)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-fuchsia-400 hover:underline inline-flex items-center gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                    {Permissions.isDelete && (
                      <button
                        onClick={() => setRestoreTarget(file)}
                        className="text-sm text-red-400 hover:text-red-300 inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Restore
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {restoreTarget && (
          <RestoreConfirmDialog
            file={restoreTarget}
            loading={restoring}
            onCancel={() => (restoring ? null : setRestoreTarget(null))}
            onConfirm={handleRestore}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- export wrapper with ToastProvider ---------------- */
export default function BackupPage() {
  return (
    <ToastProvider>
      <BackupInner />
    </ToastProvider>
  );
}
