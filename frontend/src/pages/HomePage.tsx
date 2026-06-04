import { useEffect, useMemo, useRef, useState } from 'react';
import apiClient, { IMAGE_URL } from '../api/apiClient';
import { toast } from 'react-toastify';
import type { Product } from '../types/Product';
import { Button, Card, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { BsCartFill, BsTrash, BsFilter } from 'react-icons/bs';
import '../styles/HomePageStyle.css';
import useCart from '../store/cartStore';
import GlobalNavbar from '../components/GlobalNavbar';
import GlobalFooter from '../components/GlobalFooter';
import GlobalChatbox from '../components/GlobalChatbox';
import { AiFillMessage } from 'react-icons/ai';

const heroImages = [
    `${IMAGE_URL}/images/high_res1.jpg`,
    `${IMAGE_URL}/images/high_res2.jpg`,
    `${IMAGE_URL}/images/high_res3.jpg`,
];

const HomePage = () => {
    const [products, setProducts] = useState<Array<Product>>([]);
    const [categories, setCategories] = useState<{ categoryId: number; name: string }[]>([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');
    const [showSortMenu, setShowSortMenu] = useState(false);

    const location = useLocation();

    const cartItems = useCart((state) => state.items);
    const addToCart = useCart((state) => state.addProduct);
    const removeFromCart = useCart((state) => state.removeProduct);
    const updateQuantity = useCart((state) => state.updateQuantity);
    const totalItems = useCart((state) => state.getTotalItems());

    const [heroIndex, setHeroIndex] = useState(0);
    const [visibleCards, setVisibleCards] = useState<{ [key: number]: boolean }>({});
    const cardsRef = useRef<HTMLDivElement[]>([]);
    const productsSectionRef = useRef<HTMLDivElement | null>(null);

    const filteredProducts = useMemo(() => {
        let filtered = [...products];

        const params = new URLSearchParams(location.search);
        const query = params.get('q');
        const categoryName = params.get('category');

        if (query && query.trim() !== '') {
            const lower = query.toLowerCase();
            filtered = filtered.filter((p) => p.name.toLowerCase().includes(lower));
        }

        if (categoryName && categories.length > 0) {
            const normalized = decodeURIComponent(categoryName).toLowerCase();
            filtered = filtered.filter((p) => {
                const cat = categories.find((c) => c.categoryId === p.categoryId);
                return cat?.name.toLowerCase() === normalized;
            });
        }

        const sorted = [...filtered];

        if (sortOrder === 'asc') {
            sorted.sort((a, b) => a.price - b.price);
        } else if (sortOrder === 'desc') {
            sorted.sort((a, b) => b.price - a.price);
        }

        return sorted;
    }, [location.search, products, categories, sortOrder]);

    useEffect(() => {
        apiClient
            .get('/categories')
            .then((res) => setCategories(res.data))
            .catch(() => console.error('Nem sikerült betölteni a kategóriákat'));
    }, []);

    useEffect(() => {
        apiClient
            .get('/products')
            .then((response) => {
                if (Array.isArray(response.data)) {
                    setProducts(response.data);
                } else {
                    console.error('Products response is not an array:', response.data);
                    setProducts([]);
                }
            })
            .catch(() => toast.error('Sikertelen a termékek betöltése!'));
    }, []);

    // Hero image rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % heroImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Scroll-reveal animation for product cards
    useEffect(() => {
        const timer = setTimeout(() => {
            setVisibleCards({});
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        const index = Number(entry.target.getAttribute('data-index'));
                        if (entry.isIntersecting) {
                            setVisibleCards((prev) => ({ ...prev, [index]: true }));
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.05 },
            );

            cardsRef.current.forEach((card) => {
                if (card) observer.observe(card);
            });

            return () => observer.disconnect();
        }, 50);

        return () => clearTimeout(timer);
    }, [filteredProducts]);

    // Scroll to products section on search/filter
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const hasSearch = params.has('q') || params.has('category');

        if (hasSearch && productsSectionRef.current) {
            productsSectionRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [location.search]);

    const handleAddToCart = (productId: number) => {
        const existingItem = cartItems.find((item) => item.productId === productId);

        if (existingItem) {
            updateQuantity(productId, existingItem.quantity + 1);
            toast.success('Mennyiség növelve a kosárban!');
        } else {
            addToCart(productId);
            toast.success('Sikeresen a kosárba tetted a terméket!');
        }
    };

    const handleRemoveFromCart = (productId: number) => {
        removeFromCart(productId);
        toast.info('Termék eltávolítva a kosárból!');
    };

    const getProductQuantity = (productId: number): number => {
        const item = cartItems.find((item) => item.productId === productId);
        return item ? item.quantity : 0;
    };

    return (
        <>
            <GlobalNavbar totalItems={totalItems} products={products} />
            <div className="hero-fullwidth">
                {heroImages.map((img, index) => (
                    <img
                        key={index}
                        src={img}
                        alt={`Hero ${index + 1}`}
                        className={`hero-fullwidth-image ${index === heroIndex ? 'active' : ''}`}
                    />
                ))}
                <div className="hero-fullwidth-overlay">
                    <h1>Virágok minden alkalomra</h1>
                    <p>Friss csokrok, gyors kiszállítás</p>
                </div>
            </div>

            <Container fluid className="homepage-container" ref={productsSectionRef}>
                <div className="homepage-inner">
                    {(new URLSearchParams(location.search).get('q') ||
                        new URLSearchParams(location.search).get('category')) && (
                        <div className="search-result-label">
                            {new URLSearchParams(location.search).get('q') ? (
                                <>
                                    Találatok:{' '}
                                    <span>"{new URLSearchParams(location.search).get('q')}"</span>
                                </>
                            ) : (
                                <>
                                    Kategória:{' '}
                                    <span>
                                        "
                                        {decodeURIComponent(
                                            new URLSearchParams(location.search).get('category')!,
                                        )}
                                        "
                                    </span>
                                </>
                            )}
                        </div>
                    )}

                    <div className="filter-bar">
                        <Button
                            variant="outline-dark"
                            onClick={() => setShowSortMenu((prev) => !prev)}
                            className="d-flex align-items-center gap-1 filter-button"
                        >
                            <BsFilter />
                            <span className="filter-text">Szűrés</span>
                        </Button>

                        {showSortMenu && (
                            <div className="filter-dropdown">
                                <div
                                    className={sortOrder === 'asc' ? 'active-sort' : ''}
                                    onClick={() => {
                                        setSortOrder((prev) => (prev === 'asc' ? '' : 'asc'));
                                        setShowSortMenu(false);
                                    }}
                                >
                                    Ár szerint növekvő
                                </div>
                                <div
                                    className={sortOrder === 'desc' ? 'active-sort' : ''}
                                    onClick={() => {
                                        setSortOrder((prev) => (prev === 'desc' ? '' : 'desc'));
                                        setShowSortMenu(false);
                                    }}
                                >
                                    Ár szerint csökkenő
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="homepage-row">
                        {filteredProducts.map((p, index) => {
                            const quantity = getProductQuantity(Number(p.productId));
                            const isInCart = quantity > 0;

                            return (
                                <div
                                    key={p.productId}
                                    ref={(el) => {
                                        if (el) cardsRef.current[index] = el;
                                    }}
                                    data-index={index}
                                    className="homepage-card-wrapper scroll-reveal"
                                    style={{
                                        opacity: visibleCards[index] ? 1 : 0,
                                        transform: visibleCards[index]
                                            ? 'translateY(0)'
                                            : 'translateY(24px)',
                                        transition: `opacity 0.6s ease ${index * 60}ms, transform 0.6s ease ${index * 60}ms`,
                                    }}
                                >
                                    <Card style={{ height: '100%' }}>
                                        <Link to={`/product/${p.productId}`}>
                                            <Card.Img
                                                variant="top"
                                                src={`${IMAGE_URL}/images/${p.imageUrl}`}
                                                alt={p.name}
                                                loading="lazy"
                                                className="product-image"
                                            />
                                        </Link>

                                        <Card.Body className="d-flex flex-column">
                                            <Link
                                                to={`/product/${p.productId}`}
                                                className="product-link mb-2"
                                            >
                                                <Card.Title className="product-name">
                                                    {p.name}
                                                </Card.Title>
                                                <Card.Text className="product-price">
                                                    {p.price.toLocaleString()} Ft
                                                </Card.Text>
                                            </Link>

                                            {isInCart ? (
                                                <div className="d-flex flex-column gap-2">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div className="quantity-controls d-flex align-items-center">
                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        Number(p.productId),
                                                                        quantity - 1,
                                                                    )
                                                                }
                                                                disabled={quantity <= 1}
                                                            >
                                                                -
                                                            </Button>
                                                            <span className="mx-2">
                                                                {quantity} db
                                                            </span>
                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        Number(p.productId),
                                                                        quantity + 1,
                                                                    )
                                                                }
                                                            >
                                                                +
                                                            </Button>
                                                        </div>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleRemoveFromCart(
                                                                    Number(p.productId),
                                                                )
                                                            }
                                                        >
                                                            <BsTrash />
                                                        </Button>
                                                    </div>
                                                    <div className="text-center">
                                                        <small className="text-muted">
                                                            Összesen:{' '}
                                                            {(p.price * quantity).toLocaleString()}{' '}
                                                            Ft
                                                        </small>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button
                                                    className="cart-button"
                                                    variant="success"
                                                    onClick={() =>
                                                        handleAddToCart(Number(p.productId))
                                                    }
                                                >
                                                    <BsCartFill />
                                                </Button>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Container>

            <GlobalChatbox isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            <button
                className="chat-bubble"
                onClick={() => setIsChatOpen((prev) => !prev)}
                style={{ display: isChatOpen ? 'none' : 'flex' }}
            >
                <AiFillMessage size={26} color="#fff" className="messageIcon" />
            </button>
            <GlobalFooter />
        </>
    );
};

export default HomePage;
