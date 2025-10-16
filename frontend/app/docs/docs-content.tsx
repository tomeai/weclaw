"use client"

import { Markdown } from "@/components/prompt-kit/markdown"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react"
import { useEffect, useState } from "react"

// Types for documentation structure
type DocSubsection = {
  id: string
  title: string
}

type DocSection = {
  id: string
  title: string
  subsections: DocSubsection[]
}

// Sample documentation structure
const docSections: DocSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    subsections: [
      { id: "introduction", title: "Introduction" },
      { id: "installation", title: "Installation" },
      { id: "quick-start", title: "Quick Start" },
    ],
  },
  {
    id: "guides",
    title: "Guides",
    subsections: [
      { id: "basic-usage", title: "Basic Usage" },
      { id: "advanced-features", title: "Advanced Features" },
      { id: "customization", title: "Customization" },
    ],
  },
  {
    id: "api-reference",
    title: "API Reference",
    subsections: [
      { id: "authentication", title: "Authentication" },
      { id: "endpoints", title: "Endpoints" },
      { id: "error-handling", title: "Error Handling" },
    ],
  },
  {
    id: "examples",
    title: "Examples",
    subsections: [
      { id: "basic-examples", title: "Basic Examples" },
      { id: "advanced-examples", title: "Advanced Examples" },
      { id: "use-cases", title: "Use Cases" },
    ],
  },
]

// Sample documentation content (Markdown)
const docContent: Record<string, string> = {
  introduction: `
# Introduction

Welcome to our documentation! This guide will help you get started with our platform and show you how to make the most of our features.

## What is WeMcp?

WeMcp is a powerful platform that allows you to build and deploy applications with ease. It provides a wide range of features and tools to help you create amazing experiences for your users.

## Key Features

- **Easy Integration**: Integrate with your existing systems with minimal effort
- **Scalability**: Scale your applications to handle millions of users
- **Security**: Enterprise-grade security to protect your data
- **Analytics**: Gain insights into how your applications are being used

## Who is this for?

This documentation is designed for developers, product managers, and anyone interested in building applications with WeMcp.
  `,
  installation: `
# Installation

Getting started with WeMcp is easy. Follow these steps to install and configure the platform.

## Prerequisites

Before you begin, make sure you have the following:

- Node.js 16 or higher
- npm or yarn
- A WeMcp account

## Installing the CLI

The easiest way to get started is by using our CLI tool:

\`\`\`bash
npm install -g wemcp-cli
\`\`\`

Or if you prefer yarn:

\`\`\`bash
yarn global add wemcp-cli
\`\`\`

## Configuration

After installing the CLI, you need to configure it with your API key:

\`\`\`bash
wemcp configure --api-key YOUR_API_KEY
\`\`\`

You can find your API key in the WeMcp dashboard under Settings > API Keys.

## Verifying the Installation

To verify that everything is set up correctly, run:

\`\`\`bash
wemcp --version
\`\`\`

This should display the version of the WeMcp CLI that you have installed.
  `,
  "quick-start": `
# Quick Start

Let's create a simple project to get you started with WeMcp.

## Creating a New Project

Use the CLI to create a new project:

\`\`\`bash
wemcp create my-first-project
cd my-first-project
\`\`\`

This will create a new directory with a basic project structure.

## Project Structure

Here's what your project structure should look like:

\`\`\`
my-first-project/
├── src/
│   ├── index.js
│   └── config.js
├── package.json
└── wemcp.config.js
\`\`\`

## Running the Project

To start the development server:

\`\`\`bash
wemcp dev
\`\`\`

This will start a local development server at http://localhost:3000.

## Making Changes

Open \`src/index.js\` in your favorite editor and make some changes. The development server will automatically reload when you save your changes.

## Deploying the Project

When you're ready to deploy your project:

\`\`\`bash
wemcp deploy
\`\`\`

This will build and deploy your project to the WeMcp platform.
  `,
  "basic-usage": `
# Basic Usage

Learn how to use the core features of WeMcp.

## Creating a Resource

Resources are the building blocks of your WeMcp application. To create a new resource:

\`\`\`javascript
const { createResource } = require('wemcp');

const userResource = createResource({
  name: 'users',
  schema: {
    name: { type: 'string', required: true },
    email: { type: 'string', required: true },
    age: { type: 'number' }
  }
});
\`\`\`

## Querying Data

You can query your resources using the query API:

\`\`\`javascript
const users = await userResource.query()
  .where('age', '>', 18)
  .limit(10)
  .exec();
\`\`\`

## Creating Records

To create a new record:

\`\`\`javascript
const newUser = await userResource.create({
  name: 'John Doe',
  email: 'john@example.com',
  age: 25
});
\`\`\`

## Updating Records

To update an existing record:

\`\`\`javascript
const updatedUser = await userResource.update(userId, {
  age: 26
});
\`\`\`

## Deleting Records

To delete a record:

\`\`\`javascript
await userResource.delete(userId);
\`\`\`
  `,
  "advanced-features": `
# Advanced Features

Explore the advanced features of WeMcp to build more powerful applications.

## Middleware

Middleware allows you to run code before or after certain operations:

\`\`\`javascript
userResource.use(async (ctx, next) => {
  console.log('Before operation:', ctx.operation);
  await next();
  console.log('After operation:', ctx.operation);
});
\`\`\`

## Hooks

Hooks let you run code at specific points in the lifecycle of a resource:

\`\`\`javascript
userResource.beforeCreate(async (data) => {
  // Hash the password before creating the user
  if (data.password) {
    data.password = await hashPassword(data.password);
  }
  return data;
});
\`\`\`

## Custom Validators

You can create custom validators for your schema:

\`\`\`javascript
userResource.addValidator('email', (value) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!emailRegex.test(value)) {
    throw new Error('Invalid email address');
  }
});
\`\`\`

## Relationships

Define relationships between resources:

\`\`\`javascript
const postResource = createResource({
  name: 'posts',
  schema: {
    title: { type: 'string', required: true },
    content: { type: 'string', required: true },
    author: { type: 'reference', resource: 'users' }
  }
});
\`\`\`

Then you can query related data:

\`\`\`javascript
const posts = await postResource.query()
  .include('author')
  .exec();
\`\`\`
  `,
  customization: `
# Customization

Learn how to customize WeMcp to fit your specific needs.

## Custom Themes

You can customize the look and feel of your WeMcp application by creating a custom theme:

\`\`\`javascript
// themes/custom.js
module.exports = {
  colors: {
    primary: '#0070f3',
    secondary: '#ff0080',
    background: '#ffffff',
    text: '#000000'
  },
  fonts: {
    body: 'Inter, sans-serif',
    heading: 'Montserrat, sans-serif'
  },
  spacing: {
    small: '0.5rem',
    medium: '1rem',
    large: '2rem'
  }
};

// wemcp.config.js
module.exports = {
  theme: require('./themes/custom')
};
\`\`\`

## Custom Components

You can create custom components to extend the functionality of WeMcp:

\`\`\`javascript
// components/CustomButton.js
import React from 'react';
import { useTheme } from 'wemcp';

export function CustomButton({ children, ...props }) {
  const theme = useTheme();
  
  return (
    <button
      style={{
        backgroundColor: theme.colors.primary,
        color: 'white',
        padding: theme.spacing.medium,
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer'
      }}
      {...props}
    >
      {children}
    </button>
  );
}
\`\`\`

## Custom Plugins

You can create custom plugins to add new functionality to WeMcp:

\`\`\`javascript
// plugins/analytics.js
module.exports = function analyticsPlugin(options) {
  return {
    name: 'analytics',
    setup(app) {
      app.on('request', (req) => {
        // Track the request
        console.log('Request:', req.path);
      });
      
      app.on('response', (res) => {
        // Track the response
        console.log('Response:', res.statusCode);
      });
    }
  };
};

// wemcp.config.js
module.exports = {
  plugins: [
    require('./plugins/analytics')({ trackErrors: true })
  ]
};
\`\`\`
  `,
  authentication: `
# Authentication

Learn how to authenticate users in your WeMcp application.

## API Keys

WeMcp uses API keys for authentication. You can generate an API key in the WeMcp dashboard under Settings > API Keys.

## Authentication Methods

WeMcp supports several authentication methods:

### API Key Authentication

\`\`\`javascript
const wemcp = require('wemcp');

wemcp.configure({
  apiKey: 'YOUR_API_KEY'
});
\`\`\`

### OAuth Authentication

\`\`\`javascript
const wemcp = require('wemcp');

wemcp.configure({
  oauth: {
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    redirectUri: 'YOUR_REDIRECT_URI'
  }
});
\`\`\`

### JWT Authentication

\`\`\`javascript
const wemcp = require('wemcp');

wemcp.configure({
  jwt: {
    secret: 'YOUR_JWT_SECRET'
  }
});
\`\`\`

## User Authentication

To authenticate a user:

\`\`\`javascript
const user = await wemcp.auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// The user is now authenticated
console.log(user.token);
\`\`\`

## Protecting Routes

You can protect routes in your application:

\`\`\`javascript
app.get('/protected', wemcp.auth.requireAuth, (req, res) => {
  res.send('This route is protected');
});
\`\`\`
  `,
  endpoints: `
# Endpoints

Reference for all available API endpoints in WeMcp.

## Base URL

All API requests should be made to:

\`\`\`
https://api.wemcp.com/v1
\`\`\`

## Users

### Get All Users

\`\`\`
GET /users
\`\`\`

Parameters:

- \`limit\` (optional): Maximum number of users to return
- \`offset\` (optional): Number of users to skip

### Get a User

\`\`\`
GET /users/:id
\`\`\`

### Create a User

\`\`\`
POST /users
\`\`\`

Request body:

\`\`\`json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
\`\`\`

### Update a User

\`\`\`
PUT /users/:id
\`\`\`

Request body:

\`\`\`json
{
  "name": "John Smith"
}
\`\`\`

### Delete a User

\`\`\`
DELETE /users/:id
\`\`\`

## Posts

### Get All Posts

\`\`\`
GET /posts
\`\`\`

Parameters:

- \`limit\` (optional): Maximum number of posts to return
- \`offset\` (optional): Number of posts to skip
- \`author\` (optional): Filter posts by author ID

### Get a Post

\`\`\`
GET /posts/:id
\`\`\`

### Create a Post

\`\`\`
POST /posts
\`\`\`

Request body:

\`\`\`json
{
  "title": "My First Post",
  "content": "This is the content of my first post",
  "author": "user_id"
}
\`\`\`

### Update a Post

\`\`\`
PUT /posts/:id
\`\`\`

Request body:

\`\`\`json
{
  "title": "Updated Title"
}
\`\`\`

### Delete a Post

\`\`\`
DELETE /posts/:id
\`\`\`
  `,
  "error-handling": `
# Error Handling

Learn how to handle errors in your WeMcp application.

## Error Codes

WeMcp uses standard HTTP status codes to indicate the success or failure of an API request.

| Code | Description |
|------|-------------|
| 200  | OK - The request was successful |
| 201  | Created - A new resource was created |
| 400  | Bad Request - The request was invalid |
| 401  | Unauthorized - Authentication is required |
| 403  | Forbidden - The user does not have permission |
| 404  | Not Found - The resource was not found |
| 500  | Internal Server Error - Something went wrong on the server |

## Error Response Format

When an error occurs, WeMcp returns a JSON response with the following structure:

\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "A human-readable error message",
    "details": {
      // Additional information about the error
    }
  }
}
\`\`\`

## Common Error Codes

| Code | Description |
|------|-------------|
| INVALID_REQUEST | The request was invalid |
| AUTHENTICATION_REQUIRED | Authentication is required |
| PERMISSION_DENIED | The user does not have permission |
| RESOURCE_NOT_FOUND | The resource was not found |
| INTERNAL_ERROR | Something went wrong on the server |

## Handling Errors in JavaScript

\`\`\`javascript
try {
  const user = await wemcp.users.get(userId);
} catch (error) {
  if (error.code === 'RESOURCE_NOT_FOUND') {
    console.error('User not found');
  } else {
    console.error('An error occurred:', error.message);
  }
}
\`\`\`

## Validation Errors

When a validation error occurs, the error response will include details about the validation errors:

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "errors": [
        {
          "field": "email",
          "message": "Invalid email address"
        },
        {
          "field": "password",
          "message": "Password must be at least 8 characters"
        }
      ]
    }
  }
}
\`\`\`
  `,
  "basic-examples": `
# Basic Examples

Here are some basic examples to help you get started with WeMcp.

## Creating a User

\`\`\`javascript
const wemcp = require('wemcp');

async function createUser() {
  try {
    const user = await wemcp.users.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    });
    
    console.log('User created:', user);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

createUser();
\`\`\`

## Fetching Data

\`\`\`javascript
const wemcp = require('wemcp');

async function fetchPosts() {
  try {
    const posts = await wemcp.posts.list({
      limit: 10,
      include: ['author']
    });
    
    console.log('Posts:', posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
}

fetchPosts();
\`\`\`

## Updating a Resource

\`\`\`javascript
const wemcp = require('wemcp');

async function updatePost(postId) {
  try {
    const post = await wemcp.posts.update(postId, {
      title: 'Updated Title',
      content: 'Updated content'
    });
    
    console.log('Post updated:', post);
  } catch (error) {
    console.error('Error updating post:', error);
  }
}

updatePost('post_123');
\`\`\`

## Deleting a Resource

\`\`\`javascript
const wemcp = require('wemcp');

async function deletePost(postId) {
  try {
    await wemcp.posts.delete(postId);
    
    console.log('Post deleted successfully');
  } catch (error) {
    console.error('Error deleting post:', error);
  }
}

deletePost('post_123');
\`\`\`
  `,
  "advanced-examples": `
# Advanced Examples

Here are some advanced examples to help you make the most of WeMcp.

## Custom Authentication

\`\`\`javascript
const wemcp = require('wemcp');
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Custom authentication middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Protected route
app.get('/api/protected', authenticate, async (req, res) => {
  try {
    const data = await wemcp.resources.get(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
\`\`\`

## Batch Operations

\`\`\`javascript
const wemcp = require('wemcp');

async function batchCreateUsers(users) {
  try {
    const batch = wemcp.batch();
    
    for (const user of users) {
      batch.create('users', user);
    }
    
    const results = await batch.execute();
    console.log('Batch results:', results);
  } catch (error) {
    console.error('Batch error:', error);
  }
}

batchCreateUsers([
  { name: 'User 1', email: 'user1@example.com' },
  { name: 'User 2', email: 'user2@example.com' },
  { name: 'User 3', email: 'user3@example.com' }
]);
\`\`\`

## Real-time Updates

\`\`\`javascript
const wemcp = require('wemcp');

function subscribeToChanges() {
  const subscription = wemcp.posts
    .where('status', '==', 'published')
    .subscribe((posts) => {
      console.log('Posts updated:', posts);
    });
  
  // Later, when you want to unsubscribe
  // subscription.unsubscribe();
}

subscribeToChanges();
\`\`\`

## Custom Queries

\`\`\`javascript
const wemcp = require('wemcp');

async function complexQuery() {
  try {
    const posts = await wemcp.posts
      .where('author', '==', 'user_123')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    console.log('Posts:', posts);
  } catch (error) {
    console.error('Query error:', error);
  }
}

complexQuery();
\`\`\`
  `,
  "use-cases": `
# Use Cases

Explore common use cases for WeMcp.

## Building a Blog

WeMcp makes it easy to build a blog with features like posts, comments, and user authentication.

\`\`\`javascript
// Define your resources
const userResource = wemcp.createResource({
  name: 'users',
  schema: {
    name: { type: 'string', required: true },
    email: { type: 'string', required: true },
    bio: { type: 'string' }
  }
});

const postResource = wemcp.createResource({
  name: 'posts',
  schema: {
    title: { type: 'string', required: true },
    content: { type: 'string', required: true },
    author: { type: 'reference', resource: 'users', required: true },
    publishedAt: { type: 'date' }
  }
});

const commentResource = wemcp.createResource({
  name: 'comments',
  schema: {
    content: { type: 'string', required: true },
    author: { type: 'reference', resource: 'users', required: true },
    post: { type: 'reference', resource: 'posts', required: true },
    createdAt: { type: 'date', default: () => new Date() }
  }
});

// Create a new post
async function createPost(userId, title, content) {
  return await postResource.create({
    title,
    content,
    author: userId,
    publishedAt: new Date()
  });
}

// Get all posts with author information
async function getPosts() {
  return await postResource.query()
    .include('author')
    .orderBy('publishedAt', 'desc')
    .exec();
}

// Add a comment to a post
async function addComment(userId, postId, content) {
  return await commentResource.create({
    content,
    author: userId,
    post: postId
  });
}

// Get all comments for a post with author information
async function getComments(postId) {
  return await commentResource.query()
    .where('post', '==', postId)
    .include('author')
    .orderBy('createdAt', 'asc')
    .exec();
}
\`\`\`

## E-commerce Platform

WeMcp can be used to build an e-commerce platform with products, orders, and customer management.

\`\`\`javascript
// Define your resources
const productResource = wemcp.createResource({
  name: 'products',
  schema: {
    name: { type: 'string', required: true },
    description: { type: 'string' },
    price: { type: 'number', required: true },
    inventory: { type: 'number', default: 0 },
    images: { type: 'array', items: { type: 'string' } }
  }
});

const customerResource = wemcp.createResource({
  name: 'customers',
  schema: {
    name: { type: 'string', required: true },
    email: { type: 'string', required: true },
    address: { type: 'object' }
  }
});

const orderResource = wemcp.createResource({
  name: 'orders',
  schema: {
    customer: { type: 'reference', resource: 'customers', required: true },
    items: { type: 'array', required: true },
    total: { type: 'number', required: true },
    status: { type: 'string', default: 'pending' },
    createdAt: { type: 'date', default: () => new Date() }
  }
});

// Create a new product
async function createProduct(productData) {
  return await productResource.create(productData);
}

// Place an order
async function placeOrder(customerId, items) {
  // Calculate the total
  let total = 0;
  for (const item of items) {
    const product = await productResource.get(item.productId);
    total += product.price * item.quantity;
    
    // Update inventory
    await productResource.update(item.productId, {
      inventory: product.inventory - item.quantity
    });
  }
  
  // Create the order
  return await orderResource.create({
    customer: customerId,
    items,
    total
  });
}

// Get all orders for a customer
async function getCustomerOrders(customerId) {
  return await orderResource.query()
    .where('customer', '==', customerId)
    .orderBy('createdAt', 'desc')
    .exec();
}
\`\`\`

## Real-time Chat Application

WeMcp can be used to build a real-time chat application.

\`\`\`javascript
// Define your resources
const userResource = wemcp.createResource({
  name: 'users',
  schema: {
    name: { type: 'string', required: true },
    email: { type: 'string', required: true },
    avatar: { type: 'string' }
  }
});

const chatRoomResource = wemcp.createResource({
  name: 'chatRooms',
  schema: {
    name: { type: 'string', required: true },
    members: { type: 'array', items: { type: 'reference', resource: 'users' } },
    createdAt: { type: 'date', default: () => new Date() }
  }
});

const messageResource = wemcp.createResource({
  name: 'messages',
  schema: {
    content: { type: 'string', required: true },
    sender: { type: 'reference', resource: 'users', required: true },
    chatRoom: { type: 'reference', resource: 'chatRooms', required: true },
    createdAt: { type: 'date', default: () => new Date() }
  }
});

// Create a new chat room
async function createChatRoom(name, memberIds) {
  return await chatRoomResource.create({
    name,
    members: memberIds
  });
}

// Send a message
async function sendMessage(userId, chatRoomId, content) {
  return await messageResource.create({
    content,
    sender: userId,
    chatRoom: chatRoomId
  });
}

// Subscribe to new messages in a chat room
function subscribeToMessages(chatRoomId, callback) {
  return messageResource.query()
    .where('chatRoom', '==', chatRoomId)
    .orderBy('createdAt', 'asc')
    .subscribe(callback);
}
\`\`\`
  `,
}

// Navigation sidebar component
interface DocsSidebarProps {
  sections: DocSection[]
  activeSection: string
  activeSubsection: string
  onSelectSubsection: (sectionId: string, subsectionId: string) => void
  isMobile?: boolean
  onClose?: () => void
}

function DocsSidebar({
  sections,
  activeSection,
  activeSubsection,
  onSelectSubsection,
  isMobile = false,
  onClose = () => {},
}: DocsSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({})

  // Initialize expanded sections based on active section
  useEffect(() => {
    if (activeSection) {
      setExpandedSections((prev) => ({
        ...prev,
        [activeSection]: true,
      }))
    }
  }, [activeSection])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  return (
    <div className={cn("w-full", isMobile ? "px-4 py-6" : "pr-8")}>
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-semibold">Documentation</h3>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-1">
          {sections.map((section: DocSection) => (
            <div key={section.id} className="mb-4">
              <button
                onClick={() => toggleSection(section.id)}
                className="hover:text-primary flex w-full items-center justify-between py-1 text-left font-medium transition-colors"
              >
                <span>{section.title}</span>
                {expandedSections[section.id] ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>

              {expandedSections[section.id] && (
                <div className="mt-1 ml-4 space-y-1">
                  {section.subsections.map((subsection: DocSubsection) => (
                    <button
                      key={subsection.id}
                      onClick={() => {
                        onSelectSubsection(section.id, subsection.id)
                        if (isMobile) onClose()
                      }}
                      className={cn(
                        "hover:text-primary block w-full py-1 text-left text-sm transition-colors",
                        activeSubsection === subsection.id
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {subsection.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export default function DocsContent() {
  const [activeSection, setActiveSection] = useState<string>("getting-started")
  const [activeSubsection, setActiveSubsection] =
    useState<string>("introduction")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSelectSubsection = (sectionId: string, subsectionId: string) => {
    setActiveSection(sectionId)
    setActiveSubsection(subsectionId)
  }

  return (
    <div className="w-full">
      {/* Mobile Menu Button */}
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <h2 className="text-xl font-semibold">
          {activeSubsection
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </h2>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground p-2">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px]">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Documentation</h3>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <DocsSidebar
              sections={docSections}
              activeSection={activeSection}
              activeSubsection={activeSubsection}
              onSelectSubsection={handleSelectSubsection}
              isMobile={true}
              onClose={() => setIsMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Layout */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar (Desktop only) */}
        <div className="hidden w-64 flex-shrink-0 lg:block">
          <DocsSidebar
            sections={docSections}
            activeSection={activeSection}
            activeSubsection={activeSubsection}
            onSelectSubsection={handleSelectSubsection}
          />
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          <Card className="mb-8 p-6">
            <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
              <Markdown>
                {docContent[activeSubsection as keyof typeof docContent] ||
                  "# Content not found"}
              </Markdown>
            </div>
          </Card>

          {/* Navigation Tabs */}
          <div className="mt-8 mb-12">
            <Tabs defaultValue="next">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="prev">Previous</TabsTrigger>
                <TabsTrigger value="next">Next</TabsTrigger>
              </TabsList>
              <TabsContent value="prev" className="mt-4">
                <Card>
                  <div className="p-4">
                    <h3 className="text-lg font-medium">Previous Section</h3>
                    <p className="text-muted-foreground text-sm">
                      Navigate to the previous section in the documentation.
                    </p>
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="next" className="mt-4">
                <Card>
                  <div className="p-4">
                    <h3 className="text-lg font-medium">Next Section</h3>
                    <p className="text-muted-foreground text-sm">
                      Continue to the next section in the documentation.
                    </p>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
