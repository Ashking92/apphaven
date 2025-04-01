
import React, { useState, useEffect } from 'react';
import { X, Download, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const AddToHomeScreenPrompt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Check if the user has already dismissed or installed
    const hasPrompted = localStorage.getItem('pwaPromptDismissed');
    
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone || 
                        document.referrer.includes('android-app://');
    
    // Show the prompt to all users who haven't dismissed it or installed already
    if (!hasPrompted && !isStandalone) {
      // Delay the prompt for a better user experience
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleDismiss = () => {
    localStorage.setItem('pwaPromptDismissed', 'true');
    setIsOpen(false);
  };
  
  const handleRemindLater = () => {
    // Set a shorter expiration for "remind later" - show again in 3 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);
    localStorage.setItem('pwaPromptDismissed', expiryDate.toISOString());
    setIsOpen(false);
  };
  
  // Determine if iOS or Android for specific instructions
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg sm:text-xl font-bold">
            <Download className="mr-2 h-5 w-5" /> Install AppHaven App
          </DialogTitle>
          <DialogDescription className="text-base">
            Get faster access, offline capabilities, and a better experience!
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 p-2">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="ml-2 font-medium">Benefits:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Works offline - use AppHaven without internet</li>
              <li>Faster loading - no browser needed</li>
              <li>App-like experience with full-screen mode</li>
              <li>Easy access from your home screen</li>
            </ul>
          </div>
          
          {isIOS ? (
            <div className="space-y-2">
              <p className="font-medium">To install on your iPhone/iPad:</p>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Tap the share icon <span className="px-2 py-1 bg-gray-100 rounded">􀈂</span> at the bottom of your browser</li>
                <li>Scroll down and tap <span className="font-medium">"Add to Home Screen"</span></li>
                <li>Tap <span className="font-medium">"Add"</span> in the top right</li>
              </ol>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-medium">To install on your Android device:</p>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Tap the menu icon <span className="px-2 py-1 bg-gray-100 rounded">⋮</span> in your browser</li>
                <li>Tap <span className="font-medium">"Install App"</span> or <span className="font-medium">"Add to Home Screen"</span></li>
                <li>Follow the on-screen instructions</li>
              </ol>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={handleRemindLater}>
              Remind Me Later
            </Button>
            <Button variant="outline" onClick={handleDismiss}>
              No Thanks
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Install Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToHomeScreenPrompt;
