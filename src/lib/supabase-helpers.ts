/**
 * Extract file path from Supabase Storage URL
 * Example: https://xxx.supabase.co/storage/v1/object/public/images/products/123.jpg
 * Returns: { bucket: 'images', path: 'products/123.jpg' }
 */
export function extractSupabasePath(url: string): { bucket: string; path: string } | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Find 'object' index in path
    const objectIndex = pathParts.indexOf('object');
    if (objectIndex === -1) return null;
    
    // Get bucket (after 'public' or 'private')
    const bucket = pathParts[objectIndex + 2];
    
    // Get file path (everything after bucket)
    const filePath = pathParts.slice(objectIndex + 3).join('/');
    
    if (!bucket || !filePath) return null;
    
    return { bucket, path: filePath };
  } catch (error) {
    console.error('Error extracting Supabase path:', error);
    return null;
  }
}

/**
 * Delete file from Supabase Storage via API
 */
export async function deleteSupabaseFile(url: string): Promise<boolean> {
  try {
    const pathInfo = extractSupabasePath(url);
    if (!pathInfo) return false;
    
    const res = await fetch(`/api/files/${pathInfo.bucket}/${pathInfo.path}`, {
      method: 'DELETE',
    });
    
    return res.ok;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}
