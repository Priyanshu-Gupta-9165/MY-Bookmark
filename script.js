        // DOM Elements
        const bookmarkForm = document.getElementById('bookmarkForm');
        const bookmarksContainer = document.getElementById('bookmarksContainer');
        const searchInput = document.getElementById('searchInput');
        const themeToggle = document.getElementById('themeToggle');
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        const bookmarksCount = document.getElementById('bookmarksCount');
        const categoryTabs = document.getElementById('categoryTabs');
        
        // Form elements
        const descriptionInput = document.getElementById('description');
        
        // Modal elements
        const deleteModal = document.getElementById('deleteModal');
        const closeDeleteModal = document.getElementById('closeDeleteModal');
        const cancelDelete = document.getElementById('cancelDelete');
        const confirmDelete = document.getElementById('confirmDelete');
        const editModal = document.getElementById('editModal');
        const closeEditModal = document.getElementById('closeEditModal');
        const cancelEdit = document.getElementById('cancelEdit');
        const saveEdit = document.getElementById('saveEdit');
        const editForm = document.getElementById('editForm');
        const editTitle = document.getElementById('editTitle');
        const editUrl = document.getElementById('editUrl');
        const editCategory = document.getElementById('editCategory');
        const editDescription = document.getElementById('editDescription');
        
        // Initialize bookmarks array
        let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        let bookmarkToDelete = null;
        let bookmarkToEdit = null;
        
        // Initialize theme
        const currentTheme = localStorage.getItem('theme') || 'light';
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        // Form submission
        bookmarkForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('title').value;
            const url = document.getElementById('url').value;
            const category = document.getElementById('category').value;
            const description = descriptionInput.value;
            
            // Add bookmark
            addBookmark(title, url, category, description);
            
            // Reset form
            bookmarkForm.reset();
        });
        
        // Add bookmark function
        function addBookmark(title, url, category, description = '') {
            // Generate favicon URL
            const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${url}`;
            
            const bookmark = {
                id: Date.now(),
                title,
                url,
                category,
                description,
                favicon: faviconUrl,
                date: new Date().toISOString()
            };
            
            bookmarks.push(bookmark);
            saveBookmarks();
            renderBookmarks();
            showNotification('Bookmark added successfully!');
            
            // Update categories
            updateCategories();
        }
        
        // Delete bookmark
        function deleteBookmark(id) {
            bookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
            saveBookmarks();
            renderBookmarks();
            showNotification('Bookmark deleted!');
            
            // Update categories
            updateCategories();
        }
        
        // Save bookmarks to localStorage
        function saveBookmarks() {
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            updateBookmarksCount();
        }
        
        // Render bookmarks
        function renderBookmarks(filteredBookmarks = null) {
            const bookmarksToRender = filteredBookmarks || bookmarks;
            
            if (bookmarksToRender.length === 0) {
                bookmarksContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-book-open"></i>
                        <h3>No Bookmarks Found</h3>
                        <p>Try adjusting your search or add a new bookmark.</p>
                    </div>
                `;
                return;
            }
            
            bookmarksContainer.innerHTML = '';
            
            bookmarksToRender.forEach(bookmark => {
                const bookmarkCard = document.createElement('div');
                bookmarkCard.className = 'bookmark-card';
                
                // Only show description if it exists
                const descriptionHTML = bookmark.description ? `
                    <div class="bookmark-description">${bookmark.description}</div>
                ` : '';
                
                bookmarkCard.innerHTML = `
                    <div class="bookmark-header">
                        <div class="bookmark-favicon">
                            <img src="${bookmark.favicon}" alt="${bookmark.title}">
                        </div>
                        <div class="bookmark-title">${bookmark.title}</div>
                        <div class="bookmark-actions">
                            <button class="actions-btn">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div class="actions-menu">
                                <button class="action-item" data-action="edit" data-id="${bookmark.id}">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="action-item" data-action="rename" data-id="${bookmark.id}">
                                    <i class="fas fa-pen"></i> Rename
                                </button>
                                <button class="action-item" data-action="delete" data-id="${bookmark.id}">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="bookmark-body">
                        <div class="bookmark-url">${bookmark.url}</div>
                        ${descriptionHTML}
                        <span class="bookmark-category">${bookmark.category}</span>
                    </div>
                    <div class="bookmark-footer">
                        <a href="${bookmark.url}" target="_blank" class="btn btn-sm btn-go">
                            <i class="fas fa-external-link-alt"></i> Visit Website
                        </a>
                    </div>
                `;
                bookmarksContainer.appendChild(bookmarkCard);
            });
            
            // Add event listeners to action menus
            setupActionMenus();
        }
        
        // Setup action menus
        function setupActionMenus() {
            const actionsBtns = document.querySelectorAll('.actions-btn');
            
            actionsBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    // Close any other open menus
                    document.querySelectorAll('.actions-menu').forEach(menu => {
                        if (menu !== this.nextElementSibling) {
                            menu.classList.remove('show');
                        }
                    });
                    
                    // Toggle current menu
                    this.nextElementSibling.classList.toggle('show');
                });
            });
            
            // Close menus when clicking elsewhere
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.bookmark-actions')) {
                    document.querySelectorAll('.actions-menu').forEach(menu => {
                        menu.classList.remove('show');
                    });
                }
            });
            
            // Handle action items
            const actionItems = document.querySelectorAll('.action-item');
            actionItems.forEach(item => {
                item.addEventListener('click', function() {
                    const action = this.dataset.action;
                    const id = parseInt(this.dataset.id);
                    
                    if (action === 'delete') {
                        bookmarkToDelete = id;
                        deleteModal.classList.add('show');
                    } else if (action === 'edit') {
                        bookmarkToEdit = id;
                        const bookmark = bookmarks.find(b => b.id === id);
                        if (bookmark) {
                            editTitle.value = bookmark.title;
                            editUrl.value = bookmark.url;
                            editCategory.value = bookmark.category;
                            editDescription.value = bookmark.description || '';
                            editModal.classList.add('show');
                        }
                    } else if (action === 'rename') {
                        bookmarkToEdit = id;
                        const bookmark = bookmarks.find(b => b.id === id);
                        if (bookmark) {
                            editTitle.value = bookmark.title;
                            editUrl.value = bookmark.url;
                            editCategory.value = bookmark.category;
                            editDescription.value = bookmark.description || '';
                            
                            // Focus just on renaming
                            editUrl.disabled = true;
                            editCategory.disabled = true;
                            editDescription.disabled = true;
                            
                            editModal.classList.add('show');
                        }
                    }
                });
            });
        }
        
        // Search bookmarks
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            if (searchTerm === '') {
                renderBookmarks();
                return;
            }
            
            const filteredBookmarks = bookmarks.filter(bookmark => {
                return bookmark.title.toLowerCase().includes(searchTerm) || 
                       bookmark.url.toLowerCase().includes(searchTerm) || 
                       bookmark.category.toLowerCase().includes(searchTerm) ||
                       (bookmark.description && bookmark.description.toLowerCase().includes(searchTerm));
            });
            
            renderBookmarks(filteredBookmarks);
        });
        
        // Theme toggle
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            
            if (document.body.classList.contains('dark-theme')) {
                localStorage.setItem('theme', 'dark');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                localStorage.setItem('theme', 'light');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        });
        
        // Show notification
        function showNotification(message) {
            notificationText.textContent = message;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
        
        // Update bookmarks count
        function updateBookmarksCount() {
            bookmarksCount.textContent = `${bookmarks.length} bookmark${bookmarks.length !== 1 ? 's' : ''}`;
        }
        
        // Update categories
        function updateCategories() {
            // Get unique categories
            const categories = [...new Set(bookmarks.map(bookmark => bookmark.category))];
            
            // Clear existing tabs except "All"
            const tabsToRemove = document.querySelectorAll('.category-tab:not([data-category="all"])');
            tabsToRemove.forEach(tab => tab.remove());
            
            // Add new category tabs
            categories.forEach(category => {
                const tab = document.createElement('div');
                tab.className = 'category-tab';
                tab.dataset.category = category;
                tab.textContent = category;
                
                tab.addEventListener('click', function() {
                    // Remove active class from all tabs
                    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                    
                    // Add active class to clicked tab
                    this.classList.add('active');
                    
                    // Filter bookmarks
                    if (category === 'all') {
                        renderBookmarks();
                    } else {
                        const filteredBookmarks = bookmarks.filter(bookmark => bookmark.category === category);
                        renderBookmarks(filteredBookmarks);
                    }
                });
                
                categoryTabs.appendChild(tab);
            });
        }
        
        // Modal event handlers
        closeDeleteModal.addEventListener('click', () => deleteModal.classList.remove('show'));
        cancelDelete.addEventListener('click', () => deleteModal.classList.remove('show'));
        confirmDelete.addEventListener('click', () => {
            if (bookmarkToDelete) {
                deleteBookmark(bookmarkToDelete);
                bookmarkToDelete = null;
                deleteModal.classList.remove('show');
            }
        });
        
        closeEditModal.addEventListener('click', () => {
            editUrl.disabled = false;
            editCategory.disabled = false;
            editDescription.disabled = false;
            editModal.classList.remove('show');
        });
        cancelEdit.addEventListener('click', () => {
            editUrl.disabled = false;
            editCategory.disabled = false;
            editDescription.disabled = false;
            editModal.classList.remove('show');
        });
        
        saveEdit.addEventListener('click', () => {
            if (bookmarkToEdit) {
                const index = bookmarks.findIndex(b => b.id === bookmarkToEdit);
                if (index !== -1) {
                    bookmarks[index].title = editTitle.value;
                    
                    // Only update URL and category if not in rename mode
                    if (!editUrl.disabled) {
                        bookmarks[index].url = editUrl.value;
                        bookmarks[index].category = editCategory.value;
                        // Update favicon only if URL changed
                        if (bookmarks[index].url !== editUrl.value) {
                            bookmarks[index].favicon = `https://www.google.com/s2/favicons?sz=64&domain=${editUrl.value}`;
                        }
                    }
                    
                    // Update description if not in rename mode
                    if (!editDescription.disabled) {
                        bookmarks[index].description = editDescription.value;
                    }
                    
                    saveBookmarks();
                    renderBookmarks();
                    showNotification('Bookmark updated!');
                    
                    editUrl.disabled = false;
                    editCategory.disabled = false;
                    editDescription.disabled = false;
                    editModal.classList.remove('show');
                }
            }
        });
        
        // Initialize the app
        function init() {
            renderBookmarks();
            updateBookmarksCount();
            updateCategories();
            
            // Add event listener to "All Bookmarks" tab
            const allTab = document.querySelector('[data-category="all"]');
            if (allTab) {
                allTab.addEventListener('click', function() {
                    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    renderBookmarks();
                });
            }
        }
        
        // Initialize the app
        init();
        
        // Add some sample bookmarks on first run
        if (bookmarks.length === 0) {
            addBookmark('YouTube', 'https://youtube.com', 'Entertainment', 'Watch videos and listen to music');
            addBookmark('GitHub', 'https://github.com', 'Productivity', 'Code hosting platform for version control and collaboration');
            addBookmark('Wikipedia', 'https://wikipedia.org', 'Education', 'Free online encyclopedia');
        }
