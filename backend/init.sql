-- Create the database with docker then paste these SQL commands to initialize the tables and insert test data.
-- docker-compose up --build, run this to start the docker
-- docker-compose down to stop the docker

-- ==========================================
-- Users tábla
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('User','Admin') DEFAULT 'User',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==========================================
-- Categories tábla
-- ==========================================
CREATE TABLE IF NOT EXISTS categories (
    categoryId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- ==========================================
-- Products tábla
-- ==========================================
CREATE TABLE IF NOT EXISTS products (
    productId INT AUTO_INCREMENT PRIMARY KEY,
    categoryId INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    imageUrl VARCHAR(255),
    stock INT DEFAULT 0,
    helpLink VARCHAR(255),
    FOREIGN KEY (categoryId) REFERENCES categories(categoryId)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==========================================
-- Orders tábla
-- ==========================================
CREATE TABLE IF NOT EXISTS orders (
    orderId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    customerName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    orderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    phoneNumber VARCHAR(50),
    postalCode VARCHAR(20),
    city VARCHAR(100),
    address VARCHAR(255),
    message TEXT,
    totalAmount INT,
    status VARCHAR(50),
    FOREIGN KEY (userId) REFERENCES users(userId)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==========================================
-- OrderItems tábla
-- ==========================================
CREATE TABLE IF NOT EXISTS orderItems (
    orderItemId INT AUTO_INCREMENT PRIMARY KEY,
    orderId INT,
    productId INT,
    quantity INT,
    productPrice INT,
    FOREIGN KEY (orderId) REFERENCES orders(orderId)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(productId)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==========================================
-- Messages tábla
-- ==========================================
CREATE TABLE IF NOT EXISTS messages (
    messageId INT AUTO_INCREMENT PRIMARY KEY,
    threadId INT,
    senderId INT,
    receiverId INT,
    content TEXT,
    imageUrl VARCHAR(255),
    sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    isRead BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (senderId) REFERENCES users(userId)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (receiverId) REFERENCES users(userId)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==========================================
-- TESZTADATOK
-- ==========================================

-- Kategóriák
INSERT INTO categories (name) VALUES
('Cserepes növények'),
('Csokrok'),
('Szálas virágok'),
('Csomag'),
('Eszközök')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Felhasználók (példa, jelszó plaintext csak teszt)
INSERT INTO users (firstName,lastName,email,password,role)
VALUES
('Admin','User','admin@example.com','admin123','Admin'),
('Teszt','User','user@example.com','user123','User')
ON DUPLICATE KEY UPDATE email=email;

-- Termékek
INSERT INTO products (categoryId,name,description,price,imageUrl,stock,helpLink) VALUES
(1,'Phalaenopsis orchidea','Elegáns, fehér virágú orchidea cserepes kivitelben.',8500,'orchidea.jpg',15,'https://help.example.com/orchidea'),
(1,'Zöldike','Könnyen gondozható zöld szobanövény, kezdőknek ideális.',3500,'zoldike.jpg',25,'https://help.example.com/zoldike'),
(1,'Mini kaktusz','Dekoratív mini kaktusz kerámia cserépben.',2500,'kaktusz.jpg',40,'https://help.example.com/kaktusz'),
(2,'Vegyes tavaszi csokor','Színes, friss tavaszi virágokból kötött csokor.',9000,'tavaszi-csokor.jpg',20,'https://help.example.com/tavaszi-csokor'),
(2,'Vörös rózsacsokor','12 szál vörös rózsából álló klasszikus csokor.',12000,'rozsa-csokor.jpg',10,'https://help.example.com/rozsacsokor'),
(2,'Mezei virágcsokor','Természetes hatású, vadvirág jellegű csokor.',7500,'mezei-csokor.jpg',18,'https://help.example.com/mezei-csokor'),
(3,'Vörös rózsa (1 szál)','Hosszú szárú vörös rózsa.',1200,'rozsa-szalas.jpg',100,'https://help.example.com/rozsa-szalas'),
(3,'Tulipán (1 szál)','Friss, színes tulipán.',800,'tulipan.jpg',120,'https://help.example.com/tulipan'),
(3,'Liliom (1 szál)','Illatos fehér liliom.',1500,'liliom.jpg',60,'https://help.example.com/liliom'),
(4,'Romantikus ajándékcsomag','Tartalma:\n- 6 szál vörös rózsa\n- Bonbon\n- Üdvözlőkártya',14500,'romantikus-csomag.jpg',12,'https://help.example.com/romantikus-csomag'),
(4,'Születésnapi virágcsomag','Tartalma:\n- Vegyes csokor\n- Plüss figura\n- Üdvözlőkártya',16000,'szuletesnapi-csomag.jpg',10,'https://help.example.com/szuletesnapi-csomag'),
(4,'Mini figyelmesség csomag','Tartalma:\n- Mini kaktusz\n- Csokoládé',6500,'mini-csomag.jpg',20,'https://help.example.com/mini-csomag'),
(5, 'Kerti ásó', 'Ergonomikus nyélű, rozsdamentes acél kerti ásó virágágyások lazításához és ültetéshez.', 4900, 'kerti-aso.jpg', 30, 'https://help.example.com/kerti-aso'),
(5, 'Viráglocsoló kanna', 'Könnyű műanyag locsolókanna 8 literes, hosszú kiöntőcsővel a gyökérzóna célzott öntözéséhez.', 3200, 'locsolokanna.jpg', 25, 'https://help.example.com/locsolokanna'),
(5, 'Ültetési kesztyű', 'Csúszásgátló gumírozott ujjú kerti kesztyű, véd a törmelékektől és piszoktól.', 1800, 'kerti-kesztyu.jpg', 50, 'https://help.example.com/kerti-kesztyu'),
(5, 'Virágföld (20L)', 'Tápanyagban gazdag, pH-semleges virágföld cserepes és kerti virágok ültetéséhez.', 2200, 'viragfold.jpg', 60, 'https://help.example.com/viragfold'),
(5, 'Metszőolló', 'Professzionális rozsdamentes acél metszőolló elhalt virágszárak és ágak eltávolításához.', 5500, 'metszoollo.jpg', 20, 'https://help.example.com/metszollo')
ON DUPLICATE KEY UPDATE name=name;