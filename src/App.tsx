import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

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
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            StoryForge
          </h1>
          <p className="text-slate-400 text-lg">
            Building the future of storytelling.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-left">
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Version</h3>
            <p className="text-xl font-semibold text-slate-200">{appInfo?.version || "Loading..."}</p>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-left">
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">DB Status</h3>
            <p className={`text-xl font-semibold ${health?.database ? 'text-green-400' : 'text-yellow-400'}`}>
              {health ? (health.database ? "Healthy" : "Unhealthy") : "Loading..."}
            </p>
          </div>
        </div>

        <div className="pt-8">
          <p className="text-slate-500 text-sm italic">
            "Every story begins with a single word."
          </p>
        </div>
      </div>
    </main>
  );
}

export default App;
