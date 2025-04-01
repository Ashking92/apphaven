
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Upload, X, Plus, ImagePlus, FileType } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

const UploadApp = () => {
  const [name, setName] = useState('');
  const [developer, setDeveloper] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<string[]>(['']);
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md p-6">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="mb-6">You need to be logged in as an admin to upload apps.</p>
            <Button onClick={() => navigate('/')}>Return to Home</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIconFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setApkFile(e.target.files[0]);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setScreenshotFiles(prev => [...prev, ...newFiles]);
      
      // Create preview URLs
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setScreenshotPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshotFiles(prev => prev.filter((_, i) => i !== index));
    setScreenshotPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addFeatureField = () => {
    setFeatures([...features, '']);
  };

  const updateFeature = (index: number, value: string) => {
    const updatedFeatures = [...features];
    updatedFeatures[index] = value;
    setFeatures(updatedFeatures);
  };

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      const updatedFeatures = [...features];
      updatedFeatures.splice(index, 1);
      setFeatures(updatedFeatures);
    }
  };

  const validateForm = () => {
    if (!name.trim()) return 'App name is required';
    if (!developer.trim()) return 'Developer name is required';
    if (!version.trim()) return 'Version is required';
    if (!category) return 'Category is required';
    if (!description.trim()) return 'Description is required';
    if (!features[0].trim()) return 'At least one feature is required';
    if (!isFree && !price.trim()) return 'Price is required for paid apps';
    if (!iconFile) return 'App icon is required';
    if (!apkFile) return 'App APK file is required';
    return null;
  };

  const uploadFile = async (file: File, bucket: string, folder: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${uuidv4()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Get public URL for the file
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      
      console.log(`Successfully uploaded ${folder} file:`, urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error: any) {
      console.error(`Error uploading ${folder} file:`, error.message);
      throw new Error(`Failed to upload ${folder}: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    
    const validationError = validateForm();
    if (validationError) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: validationError
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      // Upload icon
      setUploadProgress(20);
      console.log("Uploading icon...");
      const iconUrl = await uploadFile(iconFile!, 'app_assets', 'icons');
      
      // Upload APK file
      setUploadProgress(40);
      console.log("Uploading APK...");
      const apkUrl = await uploadFile(apkFile!, 'app_assets', 'apks');
      
      // Upload screenshots
      setUploadProgress(60);
      console.log("Uploading screenshots...");
      const screenshotUrls = [];
      for (const screenshot of screenshotFiles) {
        const url = await uploadFile(screenshot, 'app_assets', 'screenshots');
        screenshotUrls.push(url);
      }
      
      // Filter out empty features
      const filteredFeatures = features.filter(f => f.trim() !== '');
      
      // Create app record
      setUploadProgress(80);
      console.log("Creating app record in database...");
      const { data, error } = await supabase
        .from('apps')
        .insert({
          name,
          developer,
          version,
          category,
          description,
          features: filteredFeatures,
          is_free: isFree,
          price: isFree ? null : price,
          uploaded_by: user.id,
          icon_url: iconUrl,
          app_url: apkUrl,
          screenshots: screenshotUrls,
          downloads: 0,
          platform: 'android'
        })
        .select();
      
      if (error) throw error;
      
      setUploadProgress(100);
      
      toast({
        title: "Success!",
        description: "App uploaded successfully."
      });
      
      // Redirect to the app detail page
      setTimeout(() => {
        navigate(`/app/${data[0].id}`);
      }, 1500);
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadError(error.message || "Failed to upload app. Please try again.");
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "An unexpected error occurred"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Upload New App</CardTitle>
              <CardDescription>
                Fill in the details below to add a new app to the store.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              {uploadError && (
                <div className="px-6">
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>
                      {uploadError}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              
              {isUploading && (
                <div className="px-6 mb-4">
                  <p className="text-sm font-medium mb-2">Uploading... {uploadProgress}%</p>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
              
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">App Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter app name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="developer">Developer</Label>
                      <Input
                        id="developer"
                        value={developer}
                        onChange={(e) => setDeveloper(e.target.value)}
                        placeholder="Enter developer name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        placeholder="1.0.0"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={category} onValueChange={setCategory} required>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Games">Games</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Entertainment">Entertainment</SelectItem>
                          <SelectItem value="Productivity">Productivity</SelectItem>
                          <SelectItem value="Utilities">Utilities</SelectItem>
                          <SelectItem value="Social">Social</SelectItem>
                          <SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
                          <SelectItem value="Travel">Travel</SelectItem>
                          <SelectItem value="Photography">Photography</SelectItem>
                          <SelectItem value="Music & Audio">Music & Audio</SelectItem>
                          <SelectItem value="Shopping">Shopping</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Weather">Weather</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Description and Features */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Description and Features</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your app"
                      className="min-h-[120px]"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <Label>Features</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addFeatureField}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Feature
                      </Button>
                    </div>
                    
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder={`Feature ${index + 1}`}
                          required={index === 0}
                        />
                        {features.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeature(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pricing</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is-free"
                      checked={isFree}
                      onCheckedChange={(checked) => setIsFree(checked as boolean)}
                    />
                    <Label htmlFor="is-free">This app is free</Label>
                  </div>
                  
                  {!isFree && (
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="$0.99"
                        required={!isFree}
                      />
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* App Files */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">App Files</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Icon Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="icon">App Icon</Label>
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 h-40">
                        {iconPreview ? (
                          <div className="relative w-full h-full">
                            <img
                              src={iconPreview}
                              alt="App icon preview"
                              className="w-full h-full object-contain"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-0 right-0"
                              onClick={() => {
                                setIconFile(null);
                                setIconPreview(null);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <label
                            htmlFor="icon"
                            className="flex flex-col items-center justify-center cursor-pointer w-full h-full"
                          >
                            <ImagePlus className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Click to upload icon
                            </span>
                            <input
                              id="icon"
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleIconChange}
                              required
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Recommended size: 512x512px
                      </p>
                    </div>
                    
                    {/* APK Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="apk">App APK File</Label>
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 h-40">
                        {apkFile ? (
                          <div className="flex flex-col items-center justify-center w-full h-full">
                            <FileType className="h-8 w-8 text-primary mb-2" />
                            <span className="text-sm font-medium">{apkFile.name}</span>
                            <span className="text-xs text-gray-500 mt-1">
                              {(apkFile.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => setApkFile(null)}
                            >
                              <X className="h-4 w-4 mr-1" /> Remove
                            </Button>
                          </div>
                        ) : (
                          <label
                            htmlFor="apk"
                            className="flex flex-col items-center justify-center cursor-pointer w-full h-full"
                          >
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Click to upload APK
                            </span>
                            <input
                              id="apk"
                              type="file"
                              className="hidden"
                              accept=".apk,application/vnd.android.package-archive,application/octet-stream"
                              onChange={handleApkChange}
                              required
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Maximum file size: 100MB
                      </p>
                    </div>
                  </div>
                  
                  {/* Screenshots */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="screenshots">Screenshots</Label>
                      <label
                        htmlFor="screenshots"
                        className="cursor-pointer inline-flex items-center text-primary text-sm"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Screenshot
                        <input
                          id="screenshots"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleScreenshotChange}
                        />
                      </label>
                    </div>
                    
                    {screenshotPreviews.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {screenshotPreviews.map((preview, index) => (
                          <div key={index} className="relative rounded-lg overflow-hidden h-40">
                            <img
                              src={preview}
                              alt={`Screenshot ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1"
                              onClick={() => removeScreenshot(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                          No screenshots added yet. Add at least one screenshot.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      Uploading...
                    </>
                  ) : (
                    'Upload App'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UploadApp;
