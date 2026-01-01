const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const products = [
    {
        title: 'Premium Cotton Print',
        description: 'High quality breathable cotton with traditional prints.',
        category: 'Cotton',
        imagePath: JSON.stringify(['assets/organic-cotton.png'])
    },
    {
        title: 'Designer Saree',
        description: 'Exquisite designer silk saree for grand occasions.',
        category: 'Saree’s',
        imagePath: JSON.stringify(['assets/royal-silk.png'])
    },
    {
        title: 'Handcrafted Safa',
        description: 'Traditional Rajasthani Safa with gold piping.',
        category: 'Safa',
        imagePath: JSON.stringify(['assets/gold-pattern.png'])
    }
];

db.serialize(() => {
    products.forEach(product => {
        db.run(`INSERT INTO products (title, description, category, imagePath) VALUES (?, ?, ?, ?)`,
            [product.title, product.description, product.category, product.imagePath],
            (err) => {
                if (err) console.error(err.message);
                else console.log(`Inserted ${product.title}`);
            }
        );
    });
});

db.close();
