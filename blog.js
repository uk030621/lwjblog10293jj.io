document.addEventListener("DOMContentLoaded", function() {
    const blogPostsContainer = document.getElementById("blog-posts");
    const blogForm = document.getElementById("blog-form");
    const postTitleInput = document.getElementById("post-title");
    const postContentInput = document.getElementById("post-content");
  
    // Load blog posts from IndexedDB on page load
    loadBlogPostsIndexedDB();
  
    // Event listener for form submission
    blogForm.addEventListener("submit", function(event) {
      event.preventDefault();
      const title = postTitleInput.value;
      const content = postContentInput.value;
      if (title.trim() && content.trim()) {
        const newPost = { title, content };
        addBlogPostIndexedDB(newPost); // Using IndexedDB for adding posts
        postTitleInput.value = "";
        postContentInput.value = "";
      } else {
        alert("Please enter both title and content.");
      }
    });
  
    // Function to open IndexedDB database
    function openDB() {
      return new Promise((resolve, reject) => {
        const request = window.indexedDB.open("blogDB", 1);
  
        request.onerror = function(event) {
          reject("IndexedDB error: " + event.target.errorCode);
        };
  
        request.onsuccess = function(event) {
          resolve(event.target.result);
        };
  
        request.onupgradeneeded = function(event) {
          const db = event.target.result;
          const objectStore = db.createObjectStore("blogPosts", { keyPath: "title" });
          objectStore.createIndex("content", "content", { unique: false });
        };
      });
    }
  
    // Function to add a new blog post to IndexedDB
    async function addBlogPostIndexedDB(post) {
      const db = await openDB();
      const transaction = db.transaction(["blogPosts"], "readwrite");
      const objectStore = transaction.objectStore("blogPosts");
      const request = objectStore.add(post);
  
      request.onerror = function(event) {
        console.error("Error adding post to IndexedDB:", event.target.error);
      };
  
      transaction.oncomplete = function() {
        loadBlogPostsIndexedDB(); // Reload posts after adding
      };
    }
  
    // Function to load blog posts from IndexedDB
    async function loadBlogPostsIndexedDB() {
      const db = await openDB();
      const transaction = db.transaction(["blogPosts"], "readonly");
      const objectStore = transaction.objectStore("blogPosts");
      const request = objectStore.getAll();
  
      request.onerror = function(event) {
        console.error("Error loading posts from IndexedDB:", event.target.error);
      };
  
      request.onsuccess = function(event) {
        const posts = event.target.result;
        renderBlogPosts(posts);
      };
    }
  
    // Function to render blog posts
    function renderBlogPosts(posts) {
      blogPostsContainer.innerHTML = "";
      posts.forEach(post => {
        const postElement = document.createElement("div");
        postElement.classList.add("blog-post");
        postElement.innerHTML = `
          <h2>${post.title}</h2>
          <p>${post.content}</p>
          <button class="delete-btn" data-title="${post.title}">Delete</button>
        `;
        blogPostsContainer.appendChild(postElement);
      });
  
      // Event listener for delete buttons
      const deleteButtons = document.querySelectorAll(".delete-btn");
      deleteButtons.forEach(button => {
        button.addEventListener("click", function() {
          const title = button.dataset.title;
          deleteBlogPostIndexedDB(title);
        });
      });
    }
  
    // Function to delete a blog post from IndexedDB
    async function deleteBlogPostIndexedDB(title) {
      const db = await openDB();
      const transaction = db.transaction(["blogPosts"], "readwrite");
      const objectStore = transaction.objectStore("blogPosts");
      const request = objectStore.delete(title);
  
      request.onerror = function(event) {
        console.error("Error deleting post from IndexedDB:", event.target.error);
      };
  
      transaction.oncomplete = function() {
        loadBlogPostsIndexedDB(); // Reload posts after deletion
      };
    }
  });
  