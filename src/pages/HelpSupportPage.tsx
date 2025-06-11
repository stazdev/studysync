import React, { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  MessageSquare, 
  Video, 
  FileText, 
  ChevronRight, 
  ChevronDown,
  ExternalLink,
  Mail,
  Phone,
  Clock,
  Users,
  Zap,
  Upload,
  Settings,
  Shield,
  CreditCard,
  Smartphone,
  Monitor,
  Headphones,
  Star,
  ThumbsUp,
  ThumbsDown,
  Play,
  Download,
  Globe,
  Calendar,
  Target,
  Brain,
  Award
} from 'lucide-react'

export const HelpSupportPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'faq' | 'guides' | 'contact' | 'status'>('faq')

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle },
    { id: 'getting-started', name: 'Getting Started', icon: Play },
    { id: 'ai-features', name: 'AI Features', icon: Brain },
    { id: 'study-groups', name: 'Study Groups', icon: Users },
    { id: 'content-upload', name: 'Content Upload', icon: Upload },
    { id: 'account', name: 'Account & Settings', icon: Settings },
    { id: 'billing', name: 'Billing & Plans', icon: CreditCard },
    { id: 'technical', name: 'Technical Issues', icon: Monitor },
    { id: 'mobile', name: 'Mobile App', icon: Smartphone }
  ]

  const faqs = [
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I get started with StudySync?',
      answer: 'Getting started is easy! First, create your account and complete your profile. Then, upload your first study material or join a study group. Our AI Study Buddy will guide you through the process and help you make the most of the platform.',
      helpful: 24,
      notHelpful: 2
    },
    {
      id: 2,
      category: 'ai-features',
      question: 'How does the AI Study Buddy work?',
      answer: 'Our AI Study Buddy uses advanced language models to analyze your study materials, generate personalized quizzes, create summaries, and answer your questions. You can choose from different AI personalities that match your learning style.',
      helpful: 31,
      notHelpful: 1
    },
    {
      id: 3,
      category: 'content-upload',
      question: 'What file types can I upload?',
      answer: 'You can upload PDF documents, text files (.txt), and images (JPG, PNG, GIF). Each file can be up to 10MB in size. Our AI will automatically extract text and analyze the content to create study materials.',
      helpful: 18,
      notHelpful: 3
    },
    {
      id: 4,
      category: 'study-groups',
      question: 'How do I create or join a study group?',
      answer: 'To create a group, go to the Study Groups page and click "Create Group". Fill in the details and choose your privacy settings. To join a group, browse the available groups or use the search function to find groups that match your interests.',
      helpful: 22,
      notHelpful: 1
    },
    {
      id: 5,
      category: 'account',
      question: 'How do I change my AI Study Buddy personality?',
      answer: 'Go to your Profile page and click on the "AI Buddy" tab. You can browse different personalities and select the one that best matches your learning style. Changes take effect immediately.',
      helpful: 15,
      notHelpful: 0
    },
    {
      id: 6,
      category: 'technical',
      question: 'Why is my file upload failing?',
      answer: 'File uploads may fail if the file is too large (over 10MB), in an unsupported format, or if you have a slow internet connection. Try reducing the file size or check your internet connection.',
      helpful: 12,
      notHelpful: 4
    },
    {
      id: 7,
      category: 'billing',
      question: 'What are the different subscription plans?',
      answer: 'We offer a free plan with basic features, and premium plans with advanced AI features, unlimited uploads, and priority support. Visit our pricing page for detailed information about each plan.',
      helpful: 19,
      notHelpful: 2
    },
    {
      id: 8,
      category: 'mobile',
      question: 'Is there a mobile app available?',
      answer: 'Yes! Our mobile app is available for both iOS and Android. You can download it from the App Store or Google Play Store. The mobile app includes all core features with a touch-optimized interface.',
      helpful: 27,
      notHelpful: 1
    }
  ]

  const guides = [
    {
      id: 1,
      title: 'Complete Beginner\'s Guide to StudySync',
      description: 'Everything you need to know to get started with StudySync',
      duration: '10 min read',
      category: 'Getting Started',
      icon: BookOpen,
      featured: true
    },
    {
      id: 2,
      title: 'Maximizing AI Study Buddy Features',
      description: 'Learn how to get the most out of your AI Study Buddy',
      duration: '8 min read',
      category: 'AI Features',
      icon: Brain,
      featured: true
    },
    {
      id: 3,
      title: 'Creating Effective Study Groups',
      description: 'Best practices for collaborative learning',
      duration: '6 min read',
      category: 'Study Groups',
      icon: Users,
      featured: false
    },
    {
      id: 4,
      title: 'Optimizing Content Upload for Better Analysis',
      description: 'Tips for preparing your study materials',
      duration: '5 min read',
      category: 'Content Upload',
      icon: Upload,
      featured: false
    },
    {
      id: 5,
      title: 'Advanced Quiz and Assessment Features',
      description: 'Using AI-generated quizzes effectively',
      duration: '7 min read',
      category: 'AI Features',
      icon: Target,
      featured: false
    }
  ]

  const systemStatus = [
    { service: 'AI Study Buddy', status: 'operational', uptime: '99.9%' },
    { service: 'File Upload', status: 'operational', uptime: '99.8%' },
    { service: 'Study Groups', status: 'operational', uptime: '99.9%' },
    { service: 'Authentication', status: 'operational', uptime: '100%' },
    { service: 'Mobile App', status: 'maintenance', uptime: '99.5%' }
  ]

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Help & Support</h1>
            <p className="text-primary-100">Find answers, guides, and get help when you need it</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search for help articles, guides, or common questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 text-lg py-4"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'faq', label: 'FAQ', icon: HelpCircle },
          { id: 'guides', label: 'Guides', icon: BookOpen },
          { id: 'contact', label: 'Contact', icon: MessageSquare },
          { id: 'status', label: 'System Status', icon: Monitor }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-sm font-medium'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'faq' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center space-x-3 p-3 text-left rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{category.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* FAQ List */}
          <div className="lg:col-span-3 space-y-4">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  {expandedFaq === faq.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-6 animate-slide-up">
                    <p className="text-gray-700 mb-4">{faq.answer}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">Was this helpful?</span>
                        <div className="flex items-center space-x-2">
                          <button className="flex items-center space-x-1 text-green-600 hover:text-green-700">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-sm">{faq.helpful}</span>
                          </button>
                          <button className="flex items-center space-x-1 text-red-600 hover:text-red-700">
                            <ThumbsDown className="w-4 h-4" />
                            <span className="text-sm">{faq.notHelpful}</span>
                          </button>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        categories.find(c => c.id === faq.category)?.id === 'getting-started' ? 'bg-blue-100 text-blue-700' :
                        categories.find(c => c.id === faq.category)?.id === 'ai-features' ? 'bg-purple-100 text-purple-700' :
                        categories.find(c => c.id === faq.category)?.id === 'study-groups' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {categories.find(c => c.id === faq.category)?.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search or browse different categories</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'guides' && (
        <div className="space-y-6">
          {/* Featured Guides */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Featured Guides</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guides.filter(guide => guide.featured).map((guide) => {
                const Icon = guide.icon
                return (
                  <div key={guide.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{guide.title}</h4>
                        <p className="text-gray-600 text-sm mb-3">{guide.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{guide.duration}</span>
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                            {guide.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* All Guides */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">All Guides</h3>
            <div className="space-y-4">
              {filteredGuides.map((guide) => {
                const Icon = guide.icon
                return (
                  <div key={guide.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{guide.title}</h4>
                      <p className="text-sm text-gray-600">{guide.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{guide.duration}</div>
                      <div className="text-xs text-primary-600 mt-1">{guide.category}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Options */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Live Chat</h4>
                    <p className="text-sm text-gray-600">Chat with our support team</p>
                    <p className="text-xs text-green-600">Available now</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Email Support</h4>
                    <p className="text-sm text-gray-600">support@studysync.com</p>
                    <p className="text-xs text-gray-500">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Phone Support</h4>
                    <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-xs text-gray-500">Mon-Fri, 9AM-6PM EST</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Support Hours</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-medium">10:00 AM - 4:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" placeholder="John" />
                <Input label="Last Name" placeholder="Doe" />
              </div>
              <Input label="Email" type="email" placeholder="john@example.com" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>General Question</option>
                  <option>Technical Issue</option>
                  <option>Billing Question</option>
                  <option>Feature Request</option>
                  <option>Bug Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="How can we help you?"
                />
              </div>
              <Button className="w-full" size="lg">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'status' && (
        <div className="space-y-6">
          {/* Overall Status */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">System Status</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">All Systems Operational</span>
              </div>
            </div>

            <div className="space-y-4">
              {systemStatus.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      service.status === 'operational' ? 'bg-green-500' :
                      service.status === 'maintenance' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="font-medium text-gray-900">{service.service}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">{service.uptime} uptime</span>
                    <span className={`text-sm font-medium ${
                      service.status === 'operational' ? 'text-green-600' :
                      service.status === 'maintenance' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {service.status === 'operational' ? 'Operational' :
                       service.status === 'maintenance' ? 'Maintenance' :
                       'Down'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Incidents</h3>
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Recent Incidents</h4>
              <p className="text-gray-600">All systems have been running smoothly</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}