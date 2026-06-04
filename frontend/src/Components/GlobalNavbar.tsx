import { useState, useEffect, useRef, useMemo } from 'react';
import { Button, FormControl, InputGroup, ListGroup, Dropdown } from 'react-bootstrap';
import { BsSearch, BsCartFill, BsPersonCircle, BsList, BsXLg } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/GlobalNavbarStyle.css';
import type { Product } from '../types/Product';
import useCart from '../store/cartStore';
import useAuth from '../store/authStore';
import apiClient, { IMAGE_URL } from '../api/apiClient';

type Props = {
    totalItems: number;
    products?: Product[];
};

const EMPTY_PRODUCTS: Product[] = [];
const GlobalNavbar = ({ products = EMPTY_PRODUCTS }: Props) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState<{ categoryId: number; name: string }[]>([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 576);
    const isLoggedIn = useAuth((state) => state.isLoggedIn);
    const navigate = useNavigate();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const items = useCart((state) => state.items);

    const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

    useEffect(() => {
        apiClient.get('/categories').then((res) => setCategories(res.data));
    }, []);

    const suggestions = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (term.length < 3) return [];
        return products.filter((p) => p.name.toLowerCase().includes(term)).slice(0, 5);
    }, [searchTerm, products]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth <= 576);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSearch = () => {
        if (searchTerm.trim().length >= 1) {
            navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`);
            setIsMobileMenuOpen(false);
            setSearchTerm('');
        }
    };

    const handleCategorySelect = (categoryName: string) => {
        navigate(`/?category=${encodeURIComponent(categoryName)}`);
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="header-container">
            <div className="header-inner">
                <div className="header-left-section">
                    <div className="header-left">
                        <Link
                            to="/"
                            onClick={() => {
                                setSearchTerm('');
                                setIsMobileMenuOpen(false);
                            }}
                        >
                            <img
                                src={`${IMAGE_URL}/images/logo.png`}
                                alt="Virágátrium"
                                className="navbar-logo"
                            />
                        </Link>
                    </div>

                    <Dropdown className="categories-dropdown">
                        <Dropdown.Toggle variant="" className="categories-toggle">
                            <BsList className="me-2" />
                            <span>Kategóriák</span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="categories-dropdown-menu">
                            {categories.map((cat) => (
                                <Dropdown.Item
                                    key={cat.categoryId}
                                    onClick={() => handleCategorySelect(cat.name)}
                                >
                                    {cat.name}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

                {}
                {isMobileView && (
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <BsXLg /> : <BsList />}
                    </button>
                )}

                <div
                    className="header-center"
                    ref={wrapperRef}
                    style={{
                        display: isMobileView ? (isMobileMenuOpen ? 'flex' : 'none') : 'flex',
                    }}
                >
                    <div className="search-wrapper">
                        <InputGroup className="search-input-group">
                            <FormControl
                                type="search"
                                placeholder="Keresés..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && searchTerm.trim().length >= 1) {
                                        e.preventDefault();
                                        handleSearch();
                                        (e.target as HTMLInputElement).blur();
                                    }
                                }}
                            />
                            <Button variant="outline-success" onClick={handleSearch}>
                                <BsSearch />
                            </Button>
                        </InputGroup>

                        {suggestions.length > 0 && (
                            <ListGroup className="search-suggestions">
                                {suggestions.map((p) => (
                                    <ListGroup.Item
                                        key={p.productId}
                                        action
                                        onClick={() => {
                                            setSearchTerm('');
                                            navigate(`/product/${p.productId}`);
                                            setIsMobileMenuOpen(false);
                                        }}
                                    >
                                        {p.name}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </div>
                </div>

                <div className="header-right">
                    <Link to="/cart">
                        <Button
                            variant="outline-primary"
                            className="me-2 cart-button-header"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <BsCartFill />
                            {totalItems > 0 && (
                                <span className="cart-count-badge">{totalItems}</span>
                            )}
                            <span className="cart-text">Kosár</span>
                        </Button>
                    </Link>

                    <Button
                        variant="outline-secondary"
                        onClick={() => {
                            navigate(isLoggedIn() ? '/profile' : '/login');
                            setIsMobileMenuOpen(false);
                        }}
                    >
                        <BsPersonCircle size={24} />
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default GlobalNavbar;
