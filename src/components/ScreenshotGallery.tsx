
import React, { useState } from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { X, Image, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface ScreenshotGalleryProps {
  appId: string;
  screenshots: string[];
  onUpdate: (newScreenshots: string[]) => void;
  editable?: boolean;
}

const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({ 
  appId, 
  screenshots, 
  onUpdate,
  editable = false 
}) => {
  const [uploading, setUploading] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();
  const canEdit = editable && (isAuthenticated && isAdmin);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;
    
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setUploading(true);
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const filePath = `screenshots/${appId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('app_assets')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        const { data } = supabase.storage
          .from('app_assets')
          .getPublicUrl(filePath);
          
        const newScreenshots = [...screenshots, data.publicUrl];
        onUpdate(newScreenshots);
      }
      
      toast.success('Screenshot(s) uploaded successfully');
    } catch (error: any) {
      toast.error(`Error uploading screenshot: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemoveScreenshot = async (index: number) => {
    if (!canEdit) return;
    
    try {
      const screenshotToRemove = screenshots[index];
      // Extract the file path from the URL
      const pathMatch = screenshotToRemove.match(/\/app_assets\/([^?]+)/);
      
      if (pathMatch && pathMatch[1]) {
        const filePath = pathMatch[1];
        
        // Delete the file from storage
        const { error } = await supabase.storage
          .from('app_assets')
          .remove([filePath]);
          
        if (error) {
          throw error;
        }
      }
      
      const newScreenshots = [...screenshots];
      newScreenshots.splice(index, 1);
      onUpdate(newScreenshots);
      
      toast.success('Screenshot removed successfully');
    } catch (error: any) {
      toast.error(`Error removing screenshot: ${error.message}`);
    }
  };
  
  if (screenshots.length === 0 && !canEdit) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <Image className="h-16 w-16 text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No screenshots available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {screenshots.length > 0 ? (
        <Carousel className="w-full max-w-3xl mx-auto">
          <CarouselContent>
            {screenshots.map((screenshot, index) => (
              <CarouselItem key={index} className="relative">
                {canEdit && (
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 z-10 rounded-full" 
                    onClick={() => handleRemoveScreenshot(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <img 
                  src={screenshot} 
                  alt={`App screenshot ${index + 1}`} 
                  className="w-full h-auto object-contain rounded-lg"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      ) : null}
      
      {canEdit && (
        <div className="flex justify-center">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" />
                  Add Screenshot
                </>
              )}
            </Button>
          </label>
        </div>
      )}
    </div>
  );
};

export default ScreenshotGallery;
