import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Download, Share2, ArrowLeft, MessageCircle, ThumbsUp, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import ScreenshotGallery from '@/components/ScreenshotGallery';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

interface App {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  downloads: number;
  image_url: string;
  screenshots_url: string;
  created_at: string;
  updated_at: string;
  submitted_by: string;
  version: string;
  file_size: string;
  compatibility: string;
  license: string;
  website_url: string;
  download_url: string;
  admin_approved: boolean;
}

interface Review {
  id: string;
  app_id: string;
  user_id: string | null;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
}

const AppDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [app, setApp] = useState<App | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchApp(id);
      fetchReviews();
    }
  }, [id]);

  const fetchApp = async (appId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('id', appId)
        .single();

      if (error) throw error;

      setApp(data);
    } catch (error: any) {
      console.error('Error fetching app:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load app details',
      });
      navigate('/not-found');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: app?.name || 'Check out this app!',
          text: app?.description || 'An awesome app you might like.',
          url: window.location.href,
        });
        toast({
          title: 'Shared!',
          description: 'App shared successfully.',
        });
      } catch (error: any) {
        console.error('Error sharing:', error);
        toast({
          title: 'Share Failed',
          description: error.message || 'Could not share the app.',
        });
      }
    } else {
      toast({
        title: 'Sharing Not Supported',
        description: 'Your browser does not support sharing.',
      });
    }
  };

  const handleDownload = () => {
    if (!app?.download_url) {
      toast({
        title: 'Download Error',
        description: 'No download URL available.',
      });
      return;
    }

    const downloadLink = document.createElement('a');
    downloadLink.href = app.download_url;
    downloadLink.download = app.name || 'app';
    downloadLink.target = '_blank';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    toast({
      title: 'Download Started',
      description: 'Your download should start automatically.',
    });
  };

  const fetchReviews = async () => {
    try {
      console.log("Fetching reviews for app:", id);
      const { data, error } = await supabase
        .from('app_reviews')
        .select('*')
        .eq('app_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log("Fetched reviews:", data);
      
      const reviewsWithUsername = data?.map(review => ({
        ...review,
        username: review.username || 'Anonymous'
      })) || [];
      
      setReviews(reviewsWithUsername);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast.error('Error loading reviews', {
        description: error.message || 'Failed to load reviews'
      });
    }
  };

  const handleRatingChange = (value: number) => {
    setUserRating(value);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (!userReview.trim()) {
      toast.error('Please enter a review comment');
      return;
    }
    
    try {
      setSubmittingReview(true);
      
      const { error } = await supabase
        .from('app_reviews')
        .insert({
          app_id: id,
          user_id: user?.id || null,
          username: reviewerName.trim() || 'Anonymous',
          rating: userRating,
          comment: userReview.trim()
        });
      
      if (error) throw error;
      
      toast.success('Review submitted successfully');
      setUserReview('');
      setUserRating(0);
      setReviewerName('');
      await fetchReviews();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error('Error submitting review', {
        description: error.message || 'Failed to submit review'
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        {loading ? (
          <div className="flex items-center justify-center">
            <Progress value={downloadProgress} className="w-80" />
          </div>
        ) : (
          app && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <img
                      src={app.image_url}
                      alt={app.name}
                      className="rounded-md object-cover w-full h-48 mb-4"
                    />
                    <h1 className="text-2xl font-bold text-center">{app.name}</h1>
                    <p className="text-muted-foreground text-center">{app.description}</p>
                    <div className="flex items-center mt-4">
                      <Star className="text-yellow-500 mr-1" />
                      <span>{app.rating}</span>
                      <Separator orientation="vertical" className="mx-2 h-4" />
                      <Download className="mr-1" />
                      <span>{app.downloads}</span>
                    </div>
                    <div className="flex mt-4 space-x-2">
                      <Button onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button variant="secondary" onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                    <div className="mt-4">
                      <Badge variant="secondary">{app.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="space-y-4">
                    <h2 className="text-xl font-semibold">App Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <strong>Version:</strong> {app.version}
                      </div>
                      <div>
                        <strong>File Size:</strong> {app.file_size}
                      </div>
                      <div>
                        <strong>Compatibility:</strong> {app.compatibility}
                      </div>
                      <div>
                        <strong>License:</strong> {app.license}
                      </div>
                      <div>
                        <strong>Website:</strong>{' '}
                        <a href={app.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          Visit Website
                        </a>
                      </div>
                      <div>
                        <strong>Uploaded By:</strong> {app.submitted_by}
                      </div>
                      <div>
                        <strong>Uploaded At:</strong> {format(new Date(app.created_at), 'PPP')}
                      </div>
                      <div>
                        <strong>Last Updated:</strong> {format(new Date(app.updated_at), 'PPP')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-8">
                  <CardContent>
                    <h2 className="text-xl font-semibold mb-4">Leave a Review</h2>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="reviewerName" className="block text-sm font-medium text-gray-700">
                          Your Name (Optional)
                        </label>
                        <Input
                          type="text"
                          id="reviewerName"
                          placeholder="Enter your name"
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Rating:
                        </label>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              className={`text-2xl ${value <= userRating ? 'text-yellow-500' : 'text-gray-300'} focus:outline-none`}
                              onClick={() => handleRatingChange(value)}
                            >
                              <Star />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label htmlFor="review" className="block text-sm font-medium text-gray-700">
                          Your Review:
                        </label>
                        <Textarea
                          id="review"
                          placeholder="Write your review here"
                          rows={4}
                          value={userReview}
                          onChange={(e) => setUserReview(e.target.value)}
                        />
                      </div>
                      <Button type="submit" disabled={submittingReview}>
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-3 mt-8">
                <Tabs defaultValue="screenshots">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="related">Related Apps</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="screenshots" className="mt-6">
                    {app.screenshots_url ? (
                      <ScreenshotGallery 
                        screenshots={
                          app.screenshots_url.split(',').map(url => url.trim())
                        } 
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No screenshots available</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="mt-6">
                    {reviews.length > 0 ? (
                      <ul className="space-y-4">
                        {reviews.map((review) => (
                          <li key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                            <div className="flex items-center space-x-3 mb-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{review.username.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="text-sm font-semibold">{review.username}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {format(new Date(review.created_at), 'PPP')}
                              </div>
                            </div>
                            <div className="flex items-center mb-2">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <Star
                                  key={value}
                                  className={`h-5 w-5 ${value <= review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <MessageCircle className="h-16 w-16 text-gray-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review!</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="features" className="mt-6">
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <ThumbsUp className="h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No features specified for this app.</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="related" className="mt-6">
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No related apps found.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default AppDetail;
