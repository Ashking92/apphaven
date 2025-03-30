
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash, RefreshCw, Upload, Image, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AppCard from '@/components/AppCard';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

const AdminDashboard = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const { toast: hookToast } = useToast();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    developer: '',
    category: 'Productivity',
    description: '',
    version: '1.0.0',
    is_free: true,
    price: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [appIcon, setAppIcon] = useState<File | null>(null);
  const [appFile, setAppFile] = useState<File | null>(null);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [appIconUrl, setAppIconUrl] = useState<string>('');
  
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchApps();

    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'apps'
        },
        () => {
          fetchApps();
          toast.info("App database updated", {
            description: "Changes detected in the app store!"
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, navigate]);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApps(data || []);
    } catch (error: any) {
      hookToast({
        title: 'Error fetching apps',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleAppIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAppIcon(file);
      setAppIconUrl(URL.createObjectURL(file));
    }
  };
  
  const handleAppFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAppFile(e.target.files[0]);
    }
  };
  
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      
      setScreenshots(prev => [...prev, ...newFiles]);
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
  };
  
  const removeScreenshot = (index: number) => {
    const updatedScreenshots = [...screenshots];
    const updatedUrls = [...previewUrls];
    
    URL.revokeObjectURL(updatedUrls[index]);
    updatedScreenshots.splice(index, 1);
    updatedUrls.splice(index, 1);
    
    setScreenshots(updatedScreenshots);
    setPreviewUrls(updatedUrls);
  };

  const uploadFile = async (file: File, bucket: string, folderPath: string) => {
    if (!file) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${folderPath}/${uuidv4()}.${fileExt}`;
      
      // Make sure the bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === bucket);
      
      if (!bucketExists) {
        // Create the bucket if it doesn't exist
        await supabase.storage.createBucket(bucket, {
          public: true
        });
      }
      
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);
        
      if (uploadError) {
        throw new Error(`Error uploading file: ${uploadError.message}`);
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return { path: filePath, url: urlData.publicUrl };
    } catch (error: any) {
      console.error('File upload error:', error.message);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const appData: any = {
        ...formData,
        is_free: formData.is_free === true || formData.is_free === 'true',
        price: formData.is_free === true || formData.is_free === 'true' ? null : formData.price,
        features: [],
        uploaded_by: user?.id,
      };

      // Upload app icon if provided
      if (appIcon) {
        const iconResult = await uploadFile(appIcon, 'app_icons', 'icons');
        if (iconResult) {
          appData.icon_path = iconResult.path;
          appData.icon_url = iconResult.url;
        }
      }
      
      // Upload app file if provided
      if (appFile) {
        const fileResult = await uploadFile(appFile, 'app_files', 'applications');
        if (fileResult) {
          appData.file_path = fileResult.path;
          appData.file_url = fileResult.url;
        }
      }
      
      // Upload screenshots if provided
      if (screenshots.length > 0) {
        const screenshotPaths = [];
        const screenshotUrls = [];
        
        for (const screenshot of screenshots) {
          const result = await uploadFile(screenshot, 'app_screenshots', 'screenshots');
          if (result) {
            screenshotPaths.push(result.path);
            screenshotUrls.push(result.url);
          }
        }
        
        appData.screenshot_paths = screenshotPaths;
        appData.screenshot_urls = screenshotUrls;
      }

      const { error } = await supabase
        .from('apps')
        .insert(appData);

      if (error) throw error;

      toast.success('App uploaded successfully', {
        description: 'Your app has been added to the store.'
      });

      setFormData({
        name: '',
        developer: '',
        category: 'Productivity',
        description: '',
        version: '1.0.0',
        is_free: true,
        price: '',
      });
      setAppIcon(null);
      setAppFile(null);
      setScreenshots([]);
      setPreviewUrls([]);
      setAppIconUrl('');

      setShowForm(false);
      fetchApps();
    } catch (error: any) {
      toast.error('Error uploading app', {
        description: error.message
      });
    }
  };

  const handleDeleteApp = async (id: string) => {
    try {
      const { error } = await supabase
        .from('apps')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('App deleted', {
        description: 'The app has been removed from the store.'
      });

      fetchApps();
    } catch (error: any) {
      toast.error('Error deleting app', {
        description: error.message
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="outline" 
                onClick={() => fetchApps()}
                className="flex items-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button 
                onClick={() => setShowForm(!showForm)}
                className="flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                {showForm ? 'Cancel' : 'Add New App'}
              </Button>
            </div>
          </div>

          {showForm && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Upload New App</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">App Name*</label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="developer" className="block text-sm font-medium mb-1">Developer*</label>
                    <Input 
                      id="developer" 
                      name="developer" 
                      value={formData.developer} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-1">Category*</label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Productivity">Productivity</SelectItem>
                        <SelectItem value="Photography">Photography</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Games">Games</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Shopping">Shopping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label htmlFor="version" className="block text-sm font-medium mb-1">Version*</label>
                    <Input 
                      id="version" 
                      name="version" 
                      value={formData.version} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="is_free" className="block text-sm font-medium mb-1">Pricing*</label>
                    <Select 
                      value={formData.is_free === true || formData.is_free === 'true' ? "free" : "paid"} 
                      onValueChange={(value) => handleSelectChange('is_free', value === "free" ? "true" : "false")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(formData.is_free === false || formData.is_free === 'false') && (
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium mb-1">Price*</label>
                      <Input 
                        id="price" 
                        name="price" 
                        value={formData.price} 
                        onChange={handleInputChange} 
                        placeholder="$0.00" 
                        required={formData.is_free === false || formData.is_free === 'false'} 
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">Description*</label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    rows={4} 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* App Icon Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-1">App Icon</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                      <input
                        type="file"
                        id="app-icon"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAppIconChange}
                      />
                      <label htmlFor="app-icon" className="cursor-pointer flex flex-col items-center">
                        {appIconUrl ? (
                          <img 
                            src={appIconUrl} 
                            alt="App Icon Preview" 
                            className="w-20 h-20 object-cover rounded-xl mb-2" 
                          />
                        ) : (
                          <Image className="w-8 h-8 text-gray-400 mb-2" />
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {appIcon ? appIcon.name : "Upload App Icon (512x512 recommended)"}
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  {/* App File Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-1">App Installation File</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                      <input
                        type="file"
                        id="app-file"
                        accept=".apk,.zip,.ipa,.exe"
                        className="hidden"
                        onChange={handleAppFileChange}
                      />
                      <label htmlFor="app-file" className="cursor-pointer flex flex-col items-center">
                        <FileIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {appFile ? appFile.name : "Upload APK, IPA or ZIP file"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Screenshots Upload */}
                <div>
                  <label className="block text-sm font-medium mb-1">App Screenshots</label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                    <input
                      type="file"
                      id="screenshots"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleScreenshotChange}
                    />
                    <label htmlFor="screenshots" className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Upload Screenshots (Max 5)
                      </span>
                    </label>
                  </div>
                  
                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Screenshot ${index + 1}`}
                            className="h-24 w-full object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                          <button
                            type="button"
                            onClick={() => removeScreenshot(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" className="mt-4">Upload App</Button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4">Manage Apps</h2>
              {apps.length === 0 ? (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No apps available. Add your first app!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {apps.map((app) => (
                    <div key={app.id} className="relative group">
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteApp(app.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      <AppCard 
                        id={app.id}
                        name={app.name}
                        developer={app.developer}
                        category={app.category}
                        rating={4.5} // Default rating
                        downloads="0+" // Default downloads
                        imageUrl={app.icon_url || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=500"} // Use uploaded icon or default
                        free={app.is_free}
                        price={app.price}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
