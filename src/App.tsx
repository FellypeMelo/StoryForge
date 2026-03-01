import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AppShell } from "./ui/components/AppShell";

interface AppInfo {
  name: string;
  version: string;
}

interface HealthStatus {
  database: boolean;
}

function App() {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const info = await invoke<AppInfo>("get_app_info");
        const healthStatus = await invoke<HealthStatus>("health_check");
        setAppInfo(info);
        setHealth(healthStatus);
      } catch (err) {
        console.error("Failed to fetch app data:", err);
        setError(String(err));
      }
    };

    fetchData();
  }, []);

  return (
    <AppShell appVersion={appInfo?.version} dbHealthy={health?.database}>
      <div className="space-y-8 py-12">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold tracking-tight text-slate-100">
            Welcome to the Forge
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl">
            This is your workspace. Here, you'll craft worlds, breathe life into characters, and weave intricate narratives.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-colors group">
            <h3 className="text-slate-200 font-semibold mb-2 group-hover:text-blue-400 transition-colors">Project Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Database</span>
                <span className={health?.database ? "text-green-400" : "text-yellow-400"}>
                  {health ? (health.database ? "Connected" : "Disconnected") : "Loading..."}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Version</span>
                <span className="text-slate-300">{appInfo?.version || "..."}</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-indigo-500/50 transition-colors group">
            <h3 className="text-slate-200 font-semibold mb-2 group-hover:text-indigo-400 transition-colors">Quick Actions</h3>
            <div className="flex gap-2">
              <button className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-300 transition-colors">
                New Chapter
              </button>
              <button className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-300 transition-colors">
                Add Character
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default App;
