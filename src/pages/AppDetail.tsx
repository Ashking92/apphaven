import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Download, Share2, ArrowLeft, MessageCircle, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface AppData {
  id: string;
  name: string;
  developer: string;
  category: string;
  is_free: boolean;
  price: string | null;
  description: string;
  version: string;
  features: string[];
  created_at: string;
  downloads: number | null;
  icon_url?: string | null;
  app_url?: string | null;
  screenshots?: string[] | null;
}

interface Review {
  id: string;
  app_id: string;
  user_id: string;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
}

const AppDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<string>('');
  const [userRating, setUserRating] = useState<number>(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const { toast: hookToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchAppDetails();
    fetchReviews();

    // Set up real-time subscription for app updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'apps',
          filter: `id=eq.${id}`
        },
        () => {
          fetchAppDetails();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_reviews',
          filter: `app_id=eq.${id}`
        },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Check if the current user has already reviewed this app
  useEffect(() => {
    if (user && reviews.length > 0) {
      const hasReviewed = reviews.some(review => review.user_id === user.id);
      setUserHasReviewed(hasReviewed);
    }
  }, [reviews, user]);

  const fetchAppDetails = async () => {
    try {
      setLoading(true);
      
      if (!id) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (!data) {
        navigate('/not-found');
        return;
      }
      
      setApp(data as AppData);
    } catch (error: any) {
      hookToast({
        title: 'Error fetching app details',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!id) return;

    try {
      console.log("Fetching reviews for app:", id);
      // Since there's no relationship established between app_reviews and profiles
      // in the database schema, we'll fetch reviews separately
      const { data, error } = await supabase
        .from('app_reviews')
        .select('*')
        .eq('app_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log("Fetched reviews:", data);

      // Now we need to fetch usernames for each review
      const reviewsWithUsernames = await Promise.all(
        (data || []).map(async (review: any) => {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', review.user_id)
            .single();

          if (userError) {
            console.error('Error fetching username:', userError);
            return {
              ...review,
              username: 'Anonymous'
            };
          }

          return {
            ...review,
            username: userData?.username || 'Anonymous'
          };
        })
      );

      console.log("Reviews with usernames:", reviewsWithUsernames);
      setReviews(reviewsWithUsernames);
      
      // Check if current user has reviewed
      if (user) {
        const hasReviewed = reviewsWithUsernames.some((review: Review) => review.user_id === user.id);
        setUserHasReviewed(hasReviewed);
        console.log("User has reviewed:", hasReviewed);
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast.error('Error loading reviews', {
        description: error.message
      });
    }
  };

  const handleDownload = async () => {
    if (!app) return;

    try {
      if (app.app_url) {
        window.open(app.app_url, '_blank');
      }

      const { error } = await supabase
        .from('apps')
        .update({ downloads: (app.downloads || 0) + 1 })
        .eq('id', app.id);

      if (error) throw error;

      toast.success('Download started!', {
        description: 'Thank you for downloading this app.'
      });
    } catch (error: any) {
      toast.error('Download failed', {
        description: error.message
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: app?.name || 'AppHaven App',
        text: `Check out ${app?.name} on AppHaven!`,
        url: window.location.href,
      }).catch((error) => {
        console.log('Error sharing:', error);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const submitReview = async () => {
    if (!user || !id || !userReview.trim()) return;

    try {
      setSubmittingReview(true);
      console.log("Submitting review for app:", id, "by user:", user.id);

      // First check if user already has a review
      const { data: existingReviews, error: checkError } = await supabase
        .from('app_reviews')
        .select('id')
        .eq('app_id', id)
        .eq('user_id', user.id);

      if (checkError) {
        console.error('Error checking existing reviews:', checkError);
        throw checkError;
      }

      let result;
      if (existingReviews && existingReviews.length > 0) {
        // Update existing review
        console.log("Updating existing review:", existingReviews[0].id);
        result = await supabase
          .from('app_reviews')
          .update({
            rating: userRating,
            comment: userReview.trim()
          })
          .eq('id', existingReviews[0].id);
        
        if (result.error) throw result.error;
        toast.success('Your review has been updated!');
      } else {
        // Insert new review
        console.log("Creating new review");
        result = await supabase
          .from('app_reviews')
          .insert({
            app_id: id,
            user_id: user.id,
            rating: userRating,
            comment: userReview.trim()
          });

        if (result.error) {
          if (result.error.code === '23505') { // PostgreSQL unique violation error code
            toast.error('You have already reviewed this app', {
              description: 'You can only submit one review per app'
            });
            setUserHasReviewed(true);
            return;
          }
          throw result.error;
        }
        
        toast.success('Review submitted successfully!');
      }

      setUserReview('');
      await fetchReviews(); // Refresh reviews after submission
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review', {
        description: error.message
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">App not found</h1>
            <p className="mt-2">The app you're looking for doesn't exist or has been removed.</p>
            <Link to="/" className="mt-4 inline-block text-primary hover:underline">
              Return to homepage
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 4.5;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const screenshots = app?.screenshots || [
    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=500',
    'https://images.unsplash.com/photo-1552083375-1447ce886485?auto=format&fit=crop&q=80&w=500',
    'https://images.unsplash.com/photo-1629757509637-7c99379d6d26?auto=format&fit=crop&q=80&w=500',
    'https://images.unsplash.com/photo-1579403124614-197f69d8187b?auto=format&fit=crop&q=80&w=500'
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/" className="inline-flex items-center text-primary hover:underline mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 mb-8">
            <div className="md:flex">
              <div className="md:w-1/3 p-6">
                <img 
                  src={app?.icon_url || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=500"} 
                  alt={app?.name} 
                  className="w-full h-auto max-w-xs mx-auto rounded-lg shadow-md" 
                />
                
                <div className="mt-6 space-y-4">
                  <Button className="w-full" size="lg" onClick={handleDownload}>
                    <Download className="mr-2 h-5 w-5" /> Download
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleShare}>
                    <Share2 className="mr-2 h-5 w-5" /> Share
                  </Button>
                </div>
                
                <div className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Version</span>
                    <span className="font-medium">{app?.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated</span>
                    <span className="font-medium">{app?.created_at && new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Downloads</span>
                    <span className="font-medium">{app?.downloads || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price</span>
                    <span className="font-medium">{app?.is_free ? 'Free' : app?.price || '$0.00'}</span>
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3 p-6 md:border-l md:border-gray-200 md:dark:border-gray-700">
                <div className="flex flex-wrap justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{app?.name}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{app?.developer}</p>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {app?.category}
                  </Badge>
                </div>
                
                <div className="flex items-center mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < Math.floor(Number(calculateAverageRating())) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{calculateAverageRating()}</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">({reviews.length} reviews)</span>
                </div>

                <Tabs defaultValue="description">
                  <TabsList className="mb-4">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
                    {app.features && app.features.length > 0 && (
                      <TabsTrigger value="features">Features</TabsTrigger>
                    )}
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {app?.description}
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="screenshots">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {screenshots.map((screenshot, index) => (
                        <div key={index} className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                          <img 
                            src={screenshot} 
                            alt={`${app?.name} screenshot ${index + 1}`} 
                            className="w-full h-auto object-cover" 
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  {app.features && app.features.length > 0 && (
                    <TabsContent value="features">
                      <ul className="space-y-2">
                        {app.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2 text-primary">•</span>
                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                  )}

                  <TabsContent value="reviews">
                    {user ? (
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="text-lg">Write a Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4">
                            <div className="flex mb-2 items-center">
                              <span className="mr-2">Rating:</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star}
                                    className={`h-6 w-6 cursor-pointer ${star <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                    onClick={() => setUserRating(star)}
                                  />
                                ))}
                              </div>
                            </div>
                            <Textarea 
                              placeholder="Share your experience with this app..." 
                              className="resize-none"
                              value={userReview}
                              onChange={(e) => setUserReview(e.target.value)}
                            />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            onClick={submitReview} 
                            disabled={submittingReview || !userReview.trim()}
                          >
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                          </Button>
                        </CardFooter>
                      </Card>
                    ) : (
                      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                        <p className="mb-2">Please sign in to leave a review.</p>
                        <Link to="/auth">
                          <Button>Sign In</Button>
                        </Link>
                      </div>
                    )}

                    {reviews.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        No reviews yet. Be the first to review this app!
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <Card key={review.id}>
                            <CardHeader>
                              <div className="flex justify-between items-center">
                                <div>
                                  <CardTitle className="text-base">{review.username}</CardTitle>
                                  <p className="text-xs text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AppDetail;
