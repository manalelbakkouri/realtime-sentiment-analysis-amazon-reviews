import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, BarChart, PieChart, Calendar, Filter } from "lucide-react";
import { useOfflineAnalysisData } from "@/hooks/useSentimentData";
import SentimentLineChart from "./charts/SentimentLineChart";
import SentimentBarChart from "./charts/SentimentBarChart";
import { Badge } from "@/components/ui/badge";
import SentimentBadge from "./SentimentBadge";

const OfflineDashboard = () => {
  const { data, loading } = useOfflineAnalysisData();
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  
  // Enhanced trends data
  const timeRangeData = data?.sentimentOverTime || [];
  
  // Additional data for advanced analytics
  const categoryData = [
    { name: "Electronics", positive: 65, neutral: 20, negative: 15 },
    { name: "Books", positive: 72, neutral: 18, negative: 10 },
    { name: "Home & Kitchen", positive: 58, neutral: 24, negative: 18 },
    { name: "Clothing", positive: 61, neutral: 21, negative: 18 },
    { name: "Sports", positive: 70, neutral: 15, negative: 15 }
  ];
  
  // Transform data for bar chart (top products)
  const positiveProductsData = data?.topPositiveProducts?.map((product: any) => ({
    name: `Product ${product.asin.substring(0, 5)}`,
    positive: product.count,
    neutral: 0,
    negative: 0
  })) || [];

  const negativeProductsData = data?.topNegativeProducts?.map((product: any) => ({
    name: `Product ${product.asin.substring(0, 5)}`,
    positive: 0,
    neutral: 0,
    negative: product.count
  })) || [];

  return (
    <div className="space-y-6">
      {/* Enhanced Filters */}
      <Card className="dashboard-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <span>Advanced Filters</span>
              </CardTitle>
              <CardDescription>Refine your analysis with precision</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              setTimeRange("all");
              setSentimentFilter("all");
              setSearchQuery("");
            }}>
              Reset All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Time Range</span>
              </label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="day">Last 24 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <SentimentBadge sentiment="positive" size="sm" showLabel={false} />
                <span>Sentiment Filter</span>
              </label>
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiments</SelectItem>
                  <SelectItem value="positive">Positive Only</SelectItem>
                  <SelectItem value="neutral">Neutral Only</SelectItem>
                  <SelectItem value="negative">Negative Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Product Search</span>
              </label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Search by product ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="secondary" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {searchQuery && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/20 text-primary-foreground hover:bg-primary/30">
                  Product: {searchQuery}
                </Badge>
                <Badge className="bg-primary/20 text-primary-foreground hover:bg-primary/30">
                  Time: {timeRange === "all" ? "All Time" : `Last ${timeRange}`}
                </Badge>
                <Badge className="bg-primary/20 text-primary-foreground hover:bg-primary/30">
                  Sentiment: {sentimentFilter === "all" ? "All" : sentimentFilter}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => {
                    setTimeRange("all");
                    setSentimentFilter("all");
                    setSearchQuery("");
                  }}
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Charts Section */}
      <Tabs defaultValue="trend" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trend" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Trend Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span>Top Products</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Categories</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Comparison</span>
          </TabsTrigger>
        </TabsList>

        {/* Trend Analysis Tab */}
        <TabsContent value="trend" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sentiment Trend Over Time</CardTitle>
                  <CardDescription>
                    Track how sentiment has changed over time
                  </CardDescription>
                </div>
                <Select defaultValue="daily">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Grouping" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {loading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : timeRangeData.length > 0 ? (
                <SentimentLineChart data={timeRangeData} height={400} />
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Average Sentiment Score</dt>
                    <dd className="font-medium">3.8/5</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Sentiment Volatility</dt>
                    <dd className="font-medium">Low</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Growth Trend</dt>
                    <dd className="font-medium text-sentiment-positive">+2.4%</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card col-span-2">
              <CardHeader>
                <CardTitle>Volume Analysis</CardTitle>
                <CardDescription>Review volume by sentiment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Positive</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-sentiment-positive rounded-full" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Neutral</span>
                      <span className="font-medium">20%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-sentiment-neutral rounded-full" style={{ width: "20%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Negative</span>
                      <span className="font-medium">15%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-sentiment-negative rounded-full" style={{ width: "15%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Top Positive Products</CardTitle>
                <CardDescription>
                  Products with the highest positive sentiment
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {loading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : positiveProductsData.length > 0 ? (
                  <SentimentBarChart data={positiveProductsData} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No positive product data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Top Negative Products</CardTitle>
                <CardDescription>
                  Products with the highest negative sentiment
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {loading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : negativeProductsData.length > 0 ? (
                  <SentimentBarChart data={negativeProductsData} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No negative product data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                {searchQuery 
                  ? `Analysis for product: ${searchQuery}`
                  : "Select a product from the charts or search by ID"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {searchQuery ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-border rounded-lg">
                      <div className="text-2xl font-bold text-sentiment-positive">72%</div>
                      <div className="text-sm text-muted-foreground">Positive Reviews</div>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <div className="text-2xl font-bold text-sentiment-neutral">18%</div>
                      <div className="text-sm text-muted-foreground">Neutral Reviews</div>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <div className="text-2xl font-bold text-sentiment-negative">10%</div>
                      <div className="text-sm text-muted-foreground">Negative Reviews</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Recent Reviews</h3>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <SentimentBadge sentiment={i === 3 ? "negative" : i === 2 ? "neutral" : "positive"} />
                            <span className="text-xs text-muted-foreground">2 days ago</span>
                          </div>
                          <p className="text-sm">
                            {i === 1 && "This product exceeded my expectations in every way. The quality is outstanding!"}
                            {i === 2 && "It's okay, does what it's supposed to do but nothing special about it."}
                            {i === 3 && "Very disappointed with this purchase. Wouldn't recommend it to anyone."}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-muted-foreground">
                  No product selected. Click on a product in the charts above or search by ID
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Category Sentiment Analysis</CardTitle>
              <CardDescription>Sentiment distribution across product categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <SentimentBarChart data={categoryData} height={400} />
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Category Insights</CardTitle>
                <CardDescription>Key findings from category analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-medium mb-2">Electronics</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Electronics category shows strong positive sentiment (65%) with concerns mostly related to durability and technical support.
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Product quality</Badge>
                      <Badge variant="outline">Technical support</Badge>
                      <Badge variant="outline">Price</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-medium mb-2">Books</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Books category has the highest positive sentiment (72%) with most reviews praising content quality and delivery speed.
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Content quality</Badge>
                      <Badge variant="outline">Delivery</Badge>
                      <Badge variant="outline">Price</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
                <CardDescription>Most mentioned topics in reviews by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Quality", "Price", "Delivery", "Customer Service", "Durability"].map((topic, i) => (
                    <div key={topic} className="flex items-center">
                      <div className="w-24 flex-shrink-0 text-sm">{topic}</div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${85 - i * 10}%` }}
                        ></div>
                      </div>
                      <div className="w-12 text-right text-sm font-medium">{85 - i * 10}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sentiment Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Sentiment Distribution Comparison</CardTitle>
              <CardDescription>
                Compare sentiment distributions across different timeframes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {["Overall", "Last Month", "Last Week"].map((period) => (
                    <div key={period} className="bg-dashboard-card/50 p-6 rounded-xl">
                      <h3 className="text-lg font-medium mb-4">{period}</h3>
                      <div className="flex items-center justify-around gap-4">
                        <div className="flex flex-col items-center">
                          <span className="text-sentiment-positive text-2xl font-bold">
                            {Math.floor(Math.random() * 30 + 50)}%
                          </span>
                          <span className="text-xs text-muted-foreground mt-1">Positive</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-sentiment-neutral text-2xl font-bold">
                            {Math.floor(Math.random() * 20 + 20)}%
                          </span>
                          <span className="text-xs text-muted-foreground mt-1">Neutral</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-sentiment-negative text-2xl font-bold">
                            {Math.floor(Math.random() * 15 + 10)}%
                          </span>
                          <span className="text-xs text-muted-foreground mt-1">Negative</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 space-y-3">
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                          <div className="h-full bg-sentiment-positive" style={{ width: "65%" }}></div>
                          <div className="h-full bg-sentiment-neutral" style={{ width: "20%" }}></div>
                          <div className="h-full bg-sentiment-negative" style={{ width: "15%" }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Total reviews: 1,245</span>
                          <span>Avg. score: 4.2/5</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Comparative Metrics</CardTitle>
              <CardDescription>Key performance indicators comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2">Metric</th>
                      <th className="text-right p-2">Overall</th>
                      <th className="text-right p-2">Last Month</th>
                      <th className="text-right p-2">Last Week</th>
                      <th className="text-right p-2">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="p-2">Average Rating</td>
                      <td className="text-right p-2">4.2</td>
                      <td className="text-right p-2">4.3</td>
                      <td className="text-right p-2">4.4</td>
                      <td className="text-right p-2 text-sentiment-positive">+0.1</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-2">Positive Rate</td>
                      <td className="text-right p-2">65%</td>
                      <td className="text-right p-2">67%</td>
                      <td className="text-right p-2">70%</td>
                      <td className="text-right p-2 text-sentiment-positive">+3%</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-2">Negative Rate</td>
                      <td className="text-right p-2">15%</td>
                      <td className="text-right p-2">14%</td>
                      <td className="text-right p-2">12%</td>
                      <td className="text-right p-2 text-sentiment-positive">-2%</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-2">Review Volume</td>
                      <td className="text-right p-2">5,642</td>
                      <td className="text-right p-2">1,245</td>
                      <td className="text-right p-2">342</td>
                      <td className="text-right p-2 text-sentiment-positive">+8%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OfflineDashboard;
