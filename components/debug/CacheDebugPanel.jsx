"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Trash2, BarChart3 } from "lucide-react";

const CacheDebugPanel = ({ cache }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({ hits: 0, misses: 0 });
  const [cacheSize, setCacheSize] = useState(0);

  useEffect(() => {
    const updateStats = () => {
      if (cache) {
        setStats(cache.getCacheStats());
        setCacheSize(cache.getCacheSize());
      }
    };

    let interval;
    if (isVisible) {
      updateStats();
      interval = setInterval(updateStats, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cache, isVisible]);

  if (!cache) return null;

  const hitRate =
    stats.hits + stats.misses > 0
      ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1)
      : 0;

  return (
    <div className="cache-debug-panel">
      <button
        className="cache-debug-toggle"
        onClick={() => setIsVisible(!isVisible)}
        title="Toggle Cache Debug Panel"
      >
        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
        Cache Debug
      </button>

      {isVisible && (
        <div className="cache-debug-content">
          <div className="cache-stats">
            <div className="stat-item">
              <BarChart3 size={14} />
              <span>Hit Rate: {hitRate}%</span>
            </div>
            <div className="stat-item">
              <span>Hits: {stats.hits}</span>
            </div>
            <div className="stat-item">
              <span>Misses: {stats.misses}</span>
            </div>
            <div className="stat-item">
              <span>Cached: {cacheSize} notes</span>
            </div>
          </div>

          <button
            className="cache-clear-btn"
            onClick={() => {
              cache.clearCache();
              console.log("Cache cleared via debug panel");
            }}
            title="Clear Cache"
          >
            <Trash2 size={12} />
            Clear Cache
          </button>
        </div>
      )}

      <style jsx>{`
        .cache-debug-panel {
          position: fixed;
          top: 10px;
          right: 10px;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          border-radius: 6px;
          padding: 8px;
          font-size: 12px;
          font-family: monospace;
        }

        .cache-debug-toggle {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-family: monospace;
        }

        .cache-debug-content {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .cache-stats {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 8px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .cache-clear-btn {
          background: #dc2626;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .cache-clear-btn:hover {
          background: #b91c1c;
        }
      `}</style>
    </div>
  );
};

export default CacheDebugPanel;
