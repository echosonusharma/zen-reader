function StatsTab({ 
  usedCacheSize, 
  cacheItems, 
  handleClearCache 
}) {
  return (
    <div class="stats-content">
      <div class="stat-group">
        <h3>Cache Statistics</h3>
        <div class="stat-item">
          <span class="stat-label">Total Cache Size:</span>
          <span class="stat-value">{usedCacheSize()} MB</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Cached Items:</span>
          <span class="stat-value">{cacheItems().length}</span>
        </div>
        <button class="btn btn-secondary" onClick={handleClearCache}>
          Clear Cache
        </button>
      </div>
    </div>
  );
}

export default StatsTab; 