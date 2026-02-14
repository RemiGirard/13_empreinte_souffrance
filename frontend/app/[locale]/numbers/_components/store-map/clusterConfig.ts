/**
 * CLUSTERING CONFIGURATION
 *
 * Adjust these parameters to control clustering behavior
 */

/**
 * Maximum radius (in pixels) to cluster markers together
 *
 * - Lower value (40-60) = MORE clusters, smaller groups
 * - Higher value (80-120) = FEWER clusters, larger groups
 *
 * Recommended: 100-120 to avoid tiny clusters of 2-4 markers
 *
 * Higher values = more stable clusters when panning (recommended for better UX)
 */
export const MAX_CLUSTER_RADIUS = 120;

/**
 * Zoom level at which clustering is completely disabled
 *
 * - Lower value (10-11) = Disable clustering earlier when zooming in
 * - Higher value (13-15) = Keep clustering even when closer
 * - null = Never disable clustering
 *
 * Recommended: 12 for good balance
 */
export const DISABLE_CLUSTERING_AT_ZOOM = 12;

/**
 * Minimum number of markers to form a cluster
 * Note: This is handled by MAX_CLUSTER_RADIUS
 * Higher radius = naturally prevents small clusters
 */
export const PREFERRED_MIN_CLUSTER_SIZE = 5;
