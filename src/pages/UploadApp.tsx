
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const UploadApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [appData, setAppData] = useState({
    name: '',
    description: '',
    category: '',
    version: '',
    developer: '',
    isFree: true,
    price: '',
    features: ['', '', '']
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [appIcon, setAppIcon] = useState<File | null>(null);
  const [appFile, setAppFile] = useState<File | null>(null);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const categories = [
    'Games', 'Business', 'Photography', 'Music & Audio', 'Utilities',
    'Productivity', 'Shopping', 'Education', 'Health & Fitness', 'Social'
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAppData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setAppData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setAppData(prev => ({ ...prev, isFree: checked }));
  };
  
  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...appData.features];
    updatedFeatures[index] = value;
    setAppData(prev => ({ ...prev, features: updatedFeatures }));
  };
  
  const addFeatureField = () => {
    setAppData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };
  
  const removeFeatureField = (index: number) => {
    const updatedFeatures = [...appData.features];
    updatedFeatures.splice(index, 1);
    setAppData(prev => ({ ...prev, features: updatedFeatures }));
  };
  
  const handleAppIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAppIcon(e.target.files[0]);
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
    const fileExt = file.name.split('.').pop();
    const filePath = `${folderPath}/${uuidv4()}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);
      
    if (uploadError) {
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }
    
    return filePath;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!appData.name || !appData.description || !appData.category || !appIcon || !appFile) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and upload the necessary files.",
        variant: "destructive"
      });
      return;
    }

    if (!appData.isFree && !appData.price) {
      toast({
        title: "Price Required",
        description: "Please enter a price for your app.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload app icon
      const appIconPath = await uploadFile(appIcon, 'app_files', 'icons');
      
      // Upload app file
      const appFilePath = await uploadFile(appFile, 'app_files', 'applications');
      
      // Upload screenshots
      const screenshotPaths = [];
      for (const screenshot of screenshots) {
        const path = await uploadFile(screenshot, 'app_screenshots', 'screenshots');
        screenshotPaths.push(path);
      }
      
      // Convert non-empty features to array
      const filteredFeatures = appData.features.filter(feature => feature.trim() !== '');
      
      // Create app record in database
      const { error: insertError } = await supabase.from('apps').insert({
        name: appData.name,
        description: appData.description,
        category: appData.category,
        version: appData.version,
        developer: appData.developer,
        is_free: appData.isFree,
        price: appData.isFree ? null : appData.price,
        features: filteredFeatures,
        uploaded_by: user?.id,
        icon_path: appIconPath,
        file_path: appFilePath,
        screenshot_paths: screenshotPaths
      });
      
      if (insertError) {
        throw new Error(`Error creating app record: ${insertError.message}`);
      }
      
      toast({
        title: "App Submitted",
        description: "Your app has been successfully uploaded.",
      });
      
      // Redirect to home page after successful upload
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-muted dark:bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-card dark:bg-card rounded-2xl shadow-md overflow-hidden border border-border">
            <div className="p-6 sm:p-10">
              <h1 className="text-3xl font-bold text-card-foreground mb-6">Upload Your App</h1>
              <p className="text-muted-foreground mb-8">
                Share your application with our community. Fill in the details below to get started.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">App Name*</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="App Name"
                        value={appData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="developer">Developer Name*</Label>
                      <Input
                        id="developer"
                        name="developer"
                        placeholder="Developer or Company Name"
                        value={appData.developer}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category*</Label>
                      <Select
                        value={appData.category}
                        onValueChange={(value) => handleSelectChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="version">Version*</Label>
                      <Input
                        id="version"
                        name="version"
                        placeholder="e.g., 1.0.0"
                        value={appData.version}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description*</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe your app and its features"
                      value={appData.description}
                      onChange={handleChange}
                      rows={5}
                      required
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Features</Label>
                    {appData.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder={`Feature ${index + 1}`}
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                        />
                        {appData.features.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeatureField(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2"
                      onClick={addFeatureField}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Feature
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="free-app"
                      checked={appData.isFree}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="free-app">Free App</Label>
                  </div>
                  
                  {!appData.isFree && (
                    <div className="space-y-2">
                      <Label htmlFor="price">Price*</Label>
                      <Input
                        id="price"
                        name="price"
                        placeholder="e.g., $4.99"
                        value={appData.price}
                        onChange={handleChange}
                        required={!appData.isFree}
                      />
                    </div>
                  )}
                  
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="app-icon">App Icon*</Label>
                      <div className="flex items-center justify-center border-2 border-dashed border-border rounded-lg p-6">
                        <label className="flex flex-col items-center cursor-pointer">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Upload Icon (512x512px)</span>
                          <Input
                            id="app-icon"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAppIconChange}
                          />
                        </label>
                      </div>
                      {appIcon && (
                        <p className="text-sm text-muted-foreground mt-2">{appIcon.name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="app-file">App Package*</Label>
                      <div className="flex items-center justify-center border-2 border-dashed border-border rounded-lg p-6">
                        <label className="flex flex-col items-center cursor-pointer">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Upload App File (.apk or .zip)</span>
                          <Input
                            id="app-file"
                            type="file"
                            className="hidden"
                            accept=".apk,.zip,.rar,.7z"
                            onChange={handleAppFileChange}
                          />
                        </label>
                      </div>
                      {appFile && (
                        <p className="text-sm text-muted-foreground mt-2">{appFile.name}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="screenshots">Screenshots</Label>
                    <div className="flex items-center justify-center border-2 border-dashed border-border rounded-lg p-6">
                      <label className="flex flex-col items-center cursor-pointer">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Upload Screenshots (Max 5)</span>
                        <Input
                          id="screenshots"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleScreenshotChange}
                          disabled={previewUrls.length >= 5}
                        />
                      </label>
                    </div>
                    
                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Screenshot ${index + 1}`}
                              className="h-24 w-full object-cover rounded-lg border border-border"
                            />
                            <button
                              type="button"
                              onClick={() => removeScreenshot(index)}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => navigate('/')}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Submit App"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UploadApp;
