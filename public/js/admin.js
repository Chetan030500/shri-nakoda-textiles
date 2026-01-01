const API_URL = 'http://localhost:3000/api/products';
const form = document.getElementById('productForm');
const tableBody = document.getElementById('productTableBody');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Fetch and display products
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        renderTable(result.data);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function renderTable(products) {
    tableBody.innerHTML = '';
    if (!products) return;

    products.forEach(product => {
        const row = document.createElement('tr');
        let imagePaths = [];
        try {
            // Handle if it's already an array (unlikely but possible) or a JSON string
            imagePaths = typeof product.imagePath === 'string' ? JSON.parse(product.imagePath || "[]") : (product.imagePath || []);
        } catch (e) {
            imagePaths = product.imagePath ? [product.imagePath] : [];
        }

        const firstImage = imagePaths.length > 0 ? (imagePaths[0].startsWith('http') ? imagePaths[0] : `/${imagePaths[0]}`) : 'https://via.placeholder.com/50';

        row.innerHTML = `
            <td><img src="${firstImage}" class="preview" alt="${product.title}"></td>
            <td>${product.title}</td>
            <td>${product.category}</td>
            <td class="actions">
                <button class="btn-edit">Edit</button>
                <button class="btn-delete">Delete</button>
            </td>
        `;

        row.querySelector('.btn-edit').onclick = () => editProduct(product);
        row.querySelector('.btn-delete').onclick = () => deleteProduct(product.id);

        tableBody.appendChild(row);
    });
}

// Edit Product
function editProduct(product) {
    document.getElementById('productId').value = product.id;
    document.getElementById('title').value = product.title;
    document.getElementById('description').value = product.description;
    document.getElementById('category').value = product.category;
    document.getElementById('existingImagePath').value = product.imagePath;

    submitBtn.textContent = 'Update Product';
    cancelBtn.style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Handle Form Submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('productId').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const imageFiles = document.getElementById('images').files;
    const existingImagePath = document.getElementById('existingImagePath').value;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('existingImagePath', existingImagePath);

    for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
    }

    try {
        let response;
        if (id) {
            response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                body: formData
            });
        } else {
            response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });
        }

        if (response.ok) {
            const resData = await response.json();
            console.log('Success:', resData);
            resetForm();
            await fetchProducts();
        } else {
            const errData = await response.json();
            alert('Error saving product: ' + (errData.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Fetch Error: ' + error.message);
    }
});

// Cancel Edit
cancelBtn.addEventListener('click', resetForm);

function resetForm() {
    form.reset();
    document.getElementById('productId').value = '';
    document.getElementById('existingImagePath').value = '';
    submitBtn.textContent = 'Add Product';
    cancelBtn.style.display = 'none';
}

// Delete Product
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            fetchProducts();
        } else {
            alert('Error deleting product');
        }
    } catch (error) {
        console.error('Error deleting:', error);
    }
}

// Initial Load
fetchProducts();
