// Handle menu highlighting and directory collapsing functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get all collapse buttons
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const links = document.querySelectorAll('.sidebar a');
    
    // Add click event for each button
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            // Get parent li element
            const header = this.parentNode;
            const tocItem = header.parentNode;
            // Get sublist
            const sublist = tocItem.querySelector('.toc-sublist');
            
            // Toggle sublist display state with smooth animation
            if (sublist.classList.contains('active')) {
                sublist.style.maxHeight = sublist.scrollHeight + 'px';
                setTimeout(() => {
                    sublist.style.maxHeight = '0px';
                    setTimeout(() => {
                        sublist.classList.remove('active');
                    }, 300);
                }, 10);
            } else {
                sublist.classList.add('active');
                sublist.style.maxHeight = '0px';
                setTimeout(() => {
                    sublist.style.maxHeight = sublist.scrollHeight + 'px';
                }, 10);
            }
        });
    });
    
    // Add collapse functionality for chapter title clicks
    const tocHeaders = document.querySelectorAll('.toc-header');
    tocHeaders.forEach(header => {
        header.addEventListener('click', function(e) {
            // If clicking on a link or button, don't process
            if (e.target.tagName === 'A' || e.target.classList.contains('toggle-btn')) {
                return;
            }
            
            // Trigger button click event
            const btn = this.querySelector('.toggle-btn');
            if (btn) btn.click();
        });
    });
    
    // Activate menu item corresponding to current page
    function highlightActiveLink() {
        const iframe = document.querySelector('iframe[name="contentFrame"]');
        if (!iframe || !iframe.src || iframe.src === 'about:blank') return;
        
        const currentPage = iframe.src.split('/').pop();
        console.log('Current page:', currentPage);
        
        // Clear all active states first
        links.forEach(link => {
            link.classList.remove('active');
        });
        
        // Set current page link as active
        let activeFound = false;
        links.forEach(link => {
            const linkPage = link.href.split('/').pop();
            if (linkPage === currentPage) {
                link.classList.add('active');
                activeFound = true;
                
                // If it's a sub-item, expand its parent directory
                const parentList = link.closest('.toc-sublist');
                if (parentList) {
                    parentList.classList.add('active');
                    parentList.style.maxHeight = parentList.scrollHeight + 'px';
                }
            }
        });
        
        return activeFound;
    }
    
    // Set initial active link
    highlightActiveLink();
    
    // Add smooth scroll to content
    const contentFrame = document.querySelector('iframe[name="contentFrame"]');
    if (contentFrame && contentFrame.contentDocument) {
        try {
            const iframeDoc = contentFrame.contentDocument;
            iframeDoc.body.style.scrollBehavior = 'smooth';
        } catch (e) {
            console.log('Cannot access iframe content for scroll behavior', e);
        }
    }
    
    // Update active state after iframe loads
    const iframe = document.querySelector('iframe[name="contentFrame"]');
    iframe.addEventListener('load', function() {
        // Check if iframe loaded successfully and has valid content
        try {
            // If iframe content is accessible, update highlighting
            if (this.contentDocument && this.contentDocument.body) {
                this.contentDocument.body.style.scrollBehavior = 'smooth';
                highlightActiveLink();
            }
        } catch (e) {
            // If unable to access iframe content due to cross-domain issues, still try to update highlighting based on URL
            highlightActiveLink();
        }
    });
    
    // Update active state when clicking links
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            // First remove all active states
            links.forEach(l => l.classList.remove('active'));
            // Set the currently clicked link as active
            this.classList.add('active');
            
            // Store the current page for reference
            sessionStorage.setItem('currentActivePage', this.href.split('/').pop());
            
            // If link points to valid file, expand parent directory
            const parentList = this.closest('.toc-sublist');
            if (parentList) {
                // First close all sublists
                document.querySelectorAll('.toc-sublist').forEach(sl => {
                    if (sl !== parentList) {
                        sl.classList.remove('active');
                        sl.style.maxHeight = '0px';
                    }
                });
                
                // Then open the parent list
                parentList.classList.add('active');
                parentList.style.maxHeight = parentList.scrollHeight + 'px';
            }
        });
    });

    // Delay the setup of all sublists to ensure proper initial height calculation
    setTimeout(() => {
        const allSubLists = document.querySelectorAll('.toc-sublist');
        allSubLists.forEach(sublist => {
            if (sublist.classList.contains('active')) {
                sublist.style.maxHeight = sublist.scrollHeight + 'px';
            } else {
                sublist.style.maxHeight = '0px';
            }
        });
        
        // Check if we have a stored active page and highlight it
        const storedActivePage = sessionStorage.getItem('currentActivePage');
        if (storedActivePage) {
            links.forEach(link => {
                const linkPage = link.href.split('/').pop();
                if (linkPage === storedActivePage) {
                    // Remove active class from all links
                    links.forEach(l => l.classList.remove('active'));
                    // Add active class to this link
                    link.classList.add('active');
                    
                    // Expand parent directory if needed
                    const parentList = link.closest('.toc-sublist');
                    if (parentList) {
                        parentList.classList.add('active');
                        parentList.style.maxHeight = parentList.scrollHeight + 'px';
                    }
                }
            });
        } else {
            // If no stored page, highlight based on current iframe content
            highlightActiveLink();
        }
    }, 100);

    // Code Block Copy Functionality
    function setupCodeCopy() {
        // Handle code copying for content inside iframe
        try {
            const iframe = document.querySelector('iframe[name="contentFrame"]');
            if (iframe && iframe.contentDocument) {
                const iframeDoc = iframe.contentDocument;
                setupCopyButtons(iframeDoc);
            }
        } catch (e) {
            console.log('Unable to access iframe content for copy functionality', e);
        }

        // Also setup copy buttons on the main document (for pages not using iframe)
        setupCopyButtons(document);
    }

    function setupCopyButtons(doc) {
        // Add copy buttons to all code blocks with code tags
        const codeBlocks = doc.querySelectorAll('pre > code');
        codeBlocks.forEach(block => {
            addCopyButtonToBlock(doc, block.parentNode, block);
        });
        
        // Also handle pre tags without nested code tags
        const allPreTags = doc.querySelectorAll('pre');
        allPreTags.forEach(pre => {
            // Only process pre tags that don't have a code child
            if (!pre.querySelector('code')) {
                addCopyButtonToBlock(doc, pre, pre);
            }
        });
    }
    
    function addCopyButtonToBlock(doc, pre, contentElement) {
        // Check if this code block already has a container with button
        let container = pre.closest('.code-container');
        
        if (!container) {
            // If no container exists, wrap the pre element in a container
            container = doc.createElement('div');
            container.className = 'code-container';
            
            // Create container and move pre into it
            pre.parentNode.insertBefore(container, pre);
            container.appendChild(pre);
            
            // Create and add copy button
            const copyBtn = doc.createElement('button');
            copyBtn.className = 'copy-button';
            copyBtn.textContent = 'Code kopieren';
            container.appendChild(copyBtn);
            
            // Add click event to the button
            copyBtn.addEventListener('click', function() {
                const code = contentElement.textContent;
                
                // Use navigator clipboard API when available
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(code).then(() => {
                        // Change button text temporarily
                        const originalText = this.textContent;
                        this.textContent = 'Kopiert!';
                        
                        // Add a visual feedback class
                        this.classList.add('copied');
                        
                        setTimeout(() => {
                            this.textContent = originalText;
                            this.classList.remove('copied');
                        }, 1500);
                    }).catch(err => {
                        console.error('Kopieren fehlgeschlagen:', err);
                    });
                } else {
                    // Fallback for browsers without clipboard API
                    const textarea = doc.createElement('textarea');
                    textarea.value = code;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    doc.body.appendChild(textarea);
                    textarea.select();
                    
                    try {
                        doc.execCommand('copy');
                        const originalText = this.textContent;
                        this.textContent = 'Kopiert!';
                        
                        // Add a visual feedback class
                        this.classList.add('copied');
                        
                        setTimeout(() => {
                            this.textContent = originalText;
                            this.classList.remove('copied');
                        }, 1500);
                    } catch (err) {
                        console.error('Kopieren fehlgeschlagen:', err);
                    }
                    
                    doc.body.removeChild(textarea);
                }
            });
        }
    }

    // Setup code copying when the page loads
    setupCodeCopy();

    // Setup code copying when iframe loads new content
    if (iframe) {
        iframe.addEventListener('load', setupCodeCopy);
    }
});

// Responsive sidebar toggle
document.addEventListener('DOMContentLoaded', function() {
    // Add sidebar toggle functionality on mobile devices
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    if (mediaQuery.matches) {
        // Create a toggle button for mobile view
        const container = document.querySelector('.container');
        const sidebar = document.querySelector('.sidebar');
        
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'sidebar-toggle';
        toggleBtn.innerHTML = '☰ Menü';
        document.body.insertBefore(toggleBtn, container);
        
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('sidebar-open');
            this.classList.toggle('toggle-active');
        });
    }
}); 