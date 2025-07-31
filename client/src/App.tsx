
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Moon, Sun, Search, ExternalLink, Github, Mail, Linkedin, Globe, Calendar, Clock } from 'lucide-react';
import type { AboutMe, Project, BlogPost, SearchResult } from '../../server/src/schema';

function App() {
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Data state
  const [aboutMe, setAboutMe] = useState<AboutMe | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'projects' | 'posts'>('all');
  const [isSearching, setIsSearching] = useState(false);

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Load data functions
  const loadAboutMe = useCallback(async () => {
    try {
      const result = await trpc.getAboutMe.query();
      setAboutMe(result);
    } catch (error) {
      console.error('Failed to load about me:', error);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      const result = await trpc.getProjects.query();
      setProjects(result);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }, []);

  const loadBlogPosts = useCallback(async () => {
    try {
      const result = await trpc.getBlogPosts.query();
      setBlogPosts(result);
    } catch (error) {
      console.error('Failed to load blog posts:', error);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadAboutMe();
    loadProjects();
    loadBlogPosts();
  }, [loadAboutMe, loadProjects, loadBlogPosts]);

  // Search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const result = await trpc.searchContent.query({
        query: searchQuery,
        type: searchType
      });
      setSearchResults(result);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  // Helper function to parse tech stack
  const parseTechStack = (techStack: string | null): string[] => {
    if (!techStack) return [];
    return techStack.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
  };

  // Helper function to parse tags
  const parseTags = (tags: string | null): string[] => {
    if (!tags) return [];
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Portfolio
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search Section */}
        <section className="mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Search projects and blog posts..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Select value={searchType} onValueChange={(value: 'all' | 'projects' | 'posts') => setSearchType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="projects">Projects</SelectItem>
                  <SelectItem value="posts">Posts</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} disabled={isSearching}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {searchResults && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Search Results ({searchResults.projects.length + searchResults.posts.length})
                  </h3>
                  <Button variant="ghost" size="sm" onClick={clearSearch}>
                    Clear
                  </Button>
                </div>

                {searchResults.projects.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">Projects</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {searchResults.projects.map((project: Project) => (
                        <Card key={project.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                            <CardDescription>{project.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {project.tech_stack && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {parseTechStack(project.tech_stack).map((tech: string) => (
                                  <Badge key={tech} variant="secondary" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <div className="flex gap-2">
                              {project.project_url && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Demo
                                  </a>
                                </Button>
                              )}
                              {project.github_url && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                                    <Github className="h-3 w-3 mr-1" />
                                    Code
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.posts.length > 0 && (
                  <div>
                    <h4 className="font-medium text-purple-600 dark:text-purple-400 mb-2">Blog Posts</h4>
                    <div className="space-y-4">
                      {searchResults.posts.map((post: BlogPost) => (
                        <Card key={post.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-lg">{post.title}</CardTitle>
                            {post.excerpt && (
                              <CardDescription>{post.excerpt}</CardDescription>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              {post.published_at && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {post.published_at.toLocaleDateString()}
                                </div>
                              )}
                              {post.reading_time_minutes && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {post.reading_time_minutes} min read
                                </div>
                              )}
                            </div>
                            {post.tags && (
                              <div className="flex flex-wrap gap-1">
                                {parseTags(post.tags).map((tag: string) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.projects.length === 0 && searchResults.posts.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No results found for "{searchQuery}"
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {!searchResults && (
          <>
            {/* About Me Section */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center">About Me</h2>
              {aboutMe ? (
                <Card className="max-w-4xl mx-auto">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                      <Avatar className="w-32 h-32 mx-auto md:mx-0">
                        <AvatarImage src={aboutMe.profile_image_url || undefined} alt={aboutMe.name} />
                        <AvatarFallback className="text-2xl">
                          {aboutMe.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-bold mb-2">{aboutMe.name}</h3>
                        <p className="text-lg text-blue-600 dark:text-blue-400 mb-4">{aboutMe.title}</p>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                          {aboutMe.bio}
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                          {aboutMe.email && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={`mailto:${aboutMe.email}`}>
                                <Mail className="h-4 w-4 mr-2" />
                                Email
                              </a>
                            </Button>
                          )}
                          {aboutMe.github_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={aboutMe.github_url} target="_blank" rel="noopener noreferrer">
                                <Github className="h-4 w-4 mr-2" />
                                GitHub
                              </a>
                            </Button>
                          )}
                          {aboutMe.linkedin_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={aboutMe.linkedin_url} target="_blank" rel="noopener noreferrer">
                                <Linkedin className="h-4 w-4 mr-2" />
                                LinkedIn
                              </a>
                            </Button>
                          )}
                          {aboutMe.website_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={aboutMe.website_url} target="_blank" rel="noopener noreferrer">
                                <Globe className="h-4 w-4 mr-2" />
                                Website
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <p>👋 Welcome to my portfolio! About me section will appear here once configured.</p>
                </div>
              )}
            </section>

            {/* Projects Section */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center">Projects</h2>
              {projects.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project: Project) => (
                    <Card key={project.id} className="hover:shadow-lg transition-all duration-300 group">
                      {project.image_url && (
                        <div className="aspect-video overflow-hidden rounded-t-lg">
                          <img
                            src={project.image_url}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">{project.title}</CardTitle>
                          {project.is_featured && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                              ⭐ Featured
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="line-clamp-3">
                          {project.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {project.tech_stack && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {parseTechStack(project.tech_stack).map((tech: string) => (
                              <Badge key={tech} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          {project.project_url && (
                            <Button size="sm" variant="outline" asChild className="flex-1">
                              <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Demo
                              </a>
                            </Button>
                          )}
                          {project.github_url && (
                            <Button size="sm" variant="outline" asChild className="flex-1">
                              <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                                <Github className="h-3 w-3 mr-1" />
                                Code
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                  <p>🚀 No projects yet, but exciting things are coming soon!</p>
                </div>
              )}
            </section>

            {/* Blog Posts Section */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center">Latest Blog Posts</h2>
              {blogPosts.length > 0 ? (
                <div className="max-w-4xl mx-auto space-y-8">
                  {blogPosts.map((post: BlogPost) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle className="text-2xl hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                          {post.title}
                        </CardTitle>
                        {post.excerpt && (
                          <CardDescription className="text-base leading-relaxed">
                            {post.excerpt}
                          </CardDescription>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          {post.published_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {post.published_at.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          )}
                          {post.reading_time_minutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {post.reading_time_minutes} min read
                            </div>
                          )}
                        </div>
                        {post.tags && (
                          <div className="flex flex-wrap gap-2">
                            {parseTags(post.tags).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs hover:bg-blue-50 dark:hover:bg-blue-900">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="prose dark:prose-invert max-w-none">
                          {post.content.length > 200 ? (
                            <p>{post.content.substring(0, 200)}...</p>
                          ) : (
                            <p>{post.content}</p>
                          )}
                        </div>
                        <Separator className="my-4" />
                        <Button variant="outline" size="sm" className="w-full">
                          Read More
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                  <p>📝 No blog posts yet, but interesting content is on the way!</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
          <p>© 2024 Portfolio. Built with React & tRPC.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
