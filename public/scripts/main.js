document.addEventListener('DOMContentLoaded', () => {
    console.log('Shri Nakoda Textiles website loaded.');

    // Sticky Header Scroll Effect
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '10px 0';
        } else {
            header.style.padding = '20px 0';
        }
    });

    // Mobile Menu Toggle
    const mobileToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('#nav-menu a');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            nav.classList.toggle('active');
        });
    }

    // Close menu when clicking links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            nav.classList.remove('active');
        });
    });

    // Dynamic Product Fetching with Grouping
    const collectionGrid = document.querySelector('.collection-grid');
    if (collectionGrid) {
        fetch('/api/products')
            .then(response => response.json())
            .then(result => {
                const products = result.data;
                const collectionsSection = document.getElementById('collections');
                const container = collectionsSection.querySelector('.container');

                // Clear existing content except header
                const sectionHeader = collectionsSection.querySelector('.section-header');
                container.innerHTML = '';
                container.appendChild(sectionHeader);

                if (products.length === 0) {
                    container.innerHTML += '<div style="text-align:center; padding: 40px;">No products available yet.</div>';
                    return;
                }

                // Define specific categories and order
                const allowedCategories = [
                    "Cotton", "Satin", "Malmal", "Velvet (shanil)", "Pagdi",
                    "Uparna", "Safa", "Holi print", "Doriya fabric",
                    "Dhoti-bandi", "Saree’s"
                ];

                // Group products by category
                const groups = {};
                products.forEach(product => {
                    const cat = product.category;
                    if (!groups[cat]) groups[cat] = [];
                    groups[cat].push(product);
                });

                // Render each defined category
                allowedCategories.forEach(category => {
                    const catProducts = groups[category] || [];

                    if (catProducts.length > 0) {
                        const catHeader = document.createElement('div');
                        catHeader.className = 'category-header';
                        catHeader.innerHTML = `<h3>${category}</h3>`;
                        container.appendChild(catHeader);

                        const grid = document.createElement('div');
                        grid.className = 'collection-grid';

                        catProducts.forEach(product => {
                            let imagePaths = [];
                            try {
                                imagePaths = JSON.parse(product.imagePath || "[]");
                            } catch (e) {
                                imagePaths = [product.imagePath];
                            }

                            let imageUrl = imagePaths.length > 0 ? imagePaths[0] : 'https://via.placeholder.com/300';
                            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                                imageUrl = '/' + imageUrl;
                            }

                            const whatsappMsg = encodeURIComponent(`Hello, I am interested in your product: ${product.title}. Can you please provide more details?`);
                            const whatsappUrl = `https://wa.me/918079031143?text=${whatsappMsg}`;

                            const card = `
                                <div class="collection-card">
                                    <div class="card-image" style="background-image: url('${imageUrl}');"></div>
                                    <div class="card-content">
                                        <h4>${product.title}</h4>
                                        <p>${product.description.substring(0, 60)}${product.description.length > 60 ? '...' : ''}</p>
                                        <div class="card-actions">
                                            <button class="btn-detail" onclick='openModal(${JSON.stringify(product).replace(/'/g, "&apos;")})'>View Details</button>
                                            <a href="${whatsappUrl}" target="_blank" class="btn-whatsapp">
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" style="width:14px; margin-right:5px; vertical-align:middle;">
                                                WhatsApp
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            `;
                            grid.innerHTML += card;
                        });

                        container.appendChild(grid);
                    }
                });
            })
            .catch(error => console.error('Error loading products:', error));
    }

    // Modal Logic
    const modal = document.getElementById('productModal');
    const closeBtn = document.querySelector('.close-modal');

    window.openModal = (product) => {
        document.getElementById('modalTitle').textContent = product.title;
        document.getElementById('modalCategory').textContent = product.category;
        document.getElementById('modalDescription').textContent = product.description;

        let imagePaths = [];
        try {
            imagePaths = JSON.parse(product.imagePath || "[]");
        } catch (e) {
            imagePaths = [product.imagePath];
        }

        const infoSection = document.querySelector('.modal-info');
        const oldThumbs = document.querySelector('.modal-thumbnails');
        if (oldThumbs) oldThumbs.remove();

        if (imagePaths.length > 1) {
            const thumbContainer = document.createElement('div');
            thumbContainer.className = 'modal-thumbnails';
            imagePaths.forEach((path) => {
                const img = document.createElement('img');
                img.src = path.startsWith('http') ? path : '/' + path;
                img.onclick = () => {
                    document.getElementById('modalImage').src = img.src;
                };
                thumbContainer.appendChild(img);
            });
            infoSection.insertBefore(thumbContainer, document.querySelector('.modal-actions'));
        }

        let firstImageUrl = imagePaths.length > 0 ? imagePaths[0] : 'https://via.placeholder.com/600';
        if (firstImageUrl && !firstImageUrl.startsWith('http') && !firstImageUrl.startsWith('/')) {
            firstImageUrl = '/' + firstImageUrl;
        }
        document.getElementById('modalImage').src = firstImageUrl;

        const whatsappMsg = encodeURIComponent(`Hello, I am interested in your product: ${product.title}. Can you please provide more details?`);
        document.getElementById('modalWhatsapp').href = `https://wa.me/918079031143?text=${whatsappMsg}`;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    // Theme Toggle Logic
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    }

    themeToggle.onclick = () => {
        body.classList.toggle('dark-mode');
        const theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
    };
});
