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
          <h2 class = "tiiitle">${post.title}</h2>
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
// Request persistent file system storage
navigator.webkitPersistentStorage.requestQuota(5 * 1024 * 1024, function(grantedBytes) {
  console.log("Storage quota granted:", grantedBytes, "bytes");
  
  // Access file system
  window.webkitRequestFileSystem(PERSISTENT, grantedBytes, function(fs) {
    console.log("File system access granted");
    
    // Create file 'data.txt' and write data to it
    fs.root.getFile('data.txt', {create: true}, function(fileEntry) {
      console.log("File 'data.txt' created successfully");
      
      fileEntry.createWriter(function(fileWriter) {
        console.log("File writer created");
        
        var dataBlob = new Blob(['Hello, World!'], {type: 'text/plain'});
        
        fileWriter.onwrite = function() {
          console.log("Data written to file 'data.txt' successfully");
        };
        
        fileWriter.onerror = function(error) {
          console.error("Error writing data to file 'data.txt':", error);
        };
        
        fileWriter.write(dataBlob);
      }, errorHandler);
    }, errorHandler);
  }, errorHandler);
}, errorHandler);

function errorHandler(error) {
  console.error('Error:', error);
}
function updateDateTime() {
  var datetimeElement = document.getElementById('datetime');
  var now = new Date();
  var dateTimeString = now.toLocaleString(); // Adjust format as needed
  datetimeElement.innerHTML = 'Current Date and Time: ' + dateTimeString;
}

window.onload = function() {
  updateDateTime(); // Initial update
  setInterval(updateDateTime, 1000); // Update every second
};
  
  // Options for formatting the date
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
  
  // Format the date and time separately
  const formattedDate = currentDate.toLocaleDateString(undefined, dateOptions);
  const formattedTime = currentDate.toLocaleTimeString(undefined, timeOptions);
  
  // Update the date element with both date and time
  dateElement.textContent = `${formattedDate} ${formattedTime}`;
  
  console.log(`Date and Time Updated: ${dateElement.textContent}`);
}

// Call updateDateTime function initially
//updateDateTime();

// Set interval to update every second
//setInterval(updateDateTime, 1000);

});


  
