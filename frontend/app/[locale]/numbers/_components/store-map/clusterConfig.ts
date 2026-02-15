/**
 * CLUSTERING CONFIGURATION
 *
 * Adjust these parameters to control clustering behavior
 */

/**
 * Maximum radius (in pixels) to cluster markers together
 *
 * - Lower value (30-50) = MORE individual markers, higher precision
 * - Higher value (80-120) = FEWER clusters, larger groups
 *
 * Current: 50 for maximum precision while still preventing overlap
 */
export const MAX_CLUSTER_RADIUS = 50;

/**
 * Zoom level at which clustering is completely disabled
 *
 * - Lower value (8-10) = Show individual markers earlier
 * - Higher value (13-15) = Keep clustering even when closer
 * - null = Never disable clustering
 *
 * Current: 10 to show individual markers sooner when zooming
 */
export const DISABLE_CLUSTERING_AT_ZOOM = 10;

/**
 * Minimum number of markers to form a cluster
 * Note: This is handled by MAX_CLUSTER_RADIUS
 * Higher radius = naturally prevents small clusters
 */
export const PREFERRED_MIN_CLUSTER_SIZE = 5;
