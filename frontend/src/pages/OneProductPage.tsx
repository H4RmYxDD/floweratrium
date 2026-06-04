import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { Product } from '../types/Product';
import { toast } from 'react-toastify';
import apiClient, { IMAGE_URL } from '../api/apiClient';
import { Container, Row, Col, Button, Spinner, Card } from 'react-bootstrap';
import '../styles/OneProductPageStyle.css';
import GlobalNavbar from '../components/GlobalNavbar';
import GlobalFooter from '../components/GlobalFooter';
import useCart from '../store/cartStore';
import { BsCartFill, BsTrash } from 'react-icons/bs';

const OneProductPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState<Product>();
    const [tools, setTools] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const totalItems = useCart((state) => state.getTotalItems());
    const addToCart = useCart((state) => state.addProduct);
    const updateQuantity = useCart((state) => state.updateQuantity);
    const cartItems = useCart((state) => state.items);
    const [quantity, setQuantity] = useState(() => {
        const item = cartItems.find((i) => i.productId === Number(productId));
        return item ? item.quantity : 0;
    });
    const navigate = useNavigate();
    const removeFromCart = useCart((state) => state.removeProduct);
    const [toolPage, setToolPage] = useState(0);

    useEffect(() => {
        apiClient
            .get(`/products/${productId}`)
            .then((res) => setProduct(res.data))
            .catch(() => toast.error('Sikertelen a termék betöltése!'))
            .finally(() => setLoading(false));
    }, [productId]);

    useEffect(() => {
        apiClient
            .get(`/products?categoryName=Eszközök`)
            .then((res) =>
                setTools(res.data.filter((t: Product) => t.productId !== Number(productId))),
            )
            .catch(() => {});
    }, [productId]);

    if (loading) {
        return (
            <>
                <GlobalNavbar totalItems={totalItems} />
                <div className="one-product-loading">
                    <Spinner animation="border" />
                </div>
                <GlobalFooter />
            </>
        );
    }

    if (!product) {
        return (
            <>
                <GlobalNavbar totalItems={totalItems} />
                <Container>A termék nem található!</Container>
                <GlobalFooter />
            </>
        );
    }

    return (
        <>
            <GlobalNavbar totalItems={totalItems} />

            <Container className="one-product-container">
                <button className="back-home-button" onClick={() => navigate('/')}>
                    ← Főoldal
                </button>
                <Row className="align-items-center">
                    <Col md={6} className="mb-4 mb-md-0">
                        <div className="one-product-image-wrapper">
                            <img
                                src={`${IMAGE_URL}/images/${product.imageUrl}`}
                                alt={product.name}
                                loading="lazy"
                            />
                        </div>
                    </Col>

                    <Col md={6}>
                        <div className="one-product-infoc one-product-wrapper">
                            <h1 className="one-product-title">{product.name}</h1>

                            <div className="one-product-price">{product.price} Ft</div>

                            <div className="one-product-description">
                                {product.description.includes('\n') ? (
                                    (() => {
                                        const lines = product.description.split('\n');
                                        const title = lines[0];
                                        const items = lines
                                            .slice(1)
                                            .map((line) => line.replace(/^- /, ''));

                                        return (
                                            <>
                                                <p className="package-title">{title}</p>
                                                <ul className="package-list">
                                                    {items.map((item, index) => (
                                                        <li key={index}>{item}</li>
                                                    ))}
                                                </ul>
                                            </>
                                        );
                                    })()
                                ) : (
                                    <p>{product.description}</p>
                                )}
                            </div>

                            {quantity === 0 ? (
                                <Button
                                    size="lg"
                                    variant="success"
                                    className="one-product-cart-btn"
                                    onClick={() => {
                                        addToCart(Number(product.productId));
                                        setQuantity(1);
                                        toast.success('Sikeresen a kosárba tetted!', {
                                            toastId: 'add-to-cart-toast',
                                        });
                                    }}
                                >
                                    <BsCartFill className="me-2" />
                                    Kosárba
                                </Button>
                            ) : (
                                <div className="cart-quantity-control">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => {
                                            if (quantity > 1) {
                                                setQuantity(quantity - 1);
                                                updateQuantity(
                                                    Number(product.productId),
                                                    quantity - 1,
                                                );
                                                toast.info('Mennyiség frissítve!', {
                                                    toastId: 'update-cart-toast',
                                                });
                                            } else {
                                                setQuantity(0);
                                                updateQuantity(Number(product.productId), 0);
                                                toast.info('Mennyiség frissítve!', {
                                                    toastId: 'update-cart-toast',
                                                });
                                            }
                                        }}
                                    >
                                        -
                                    </Button>

                                    <span className="mx-3">{quantity}</span>

                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => {
                                            setQuantity(quantity + 1);
                                            addToCart(Number(product.productId));
                                            toast.info('Mennyiség frissítve!', {
                                                toastId: 'update-cart-toast',
                                            });
                                        }}
                                    >
                                        +
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>

                {tools.length > 0 && (
                    <div className="tools-section">
                        <p className="tools-label">Kiegészítők</p>
                        <h2 className="tools-title">Ezekre is szükséged lehet</h2>
                        <div className="tools-carousel-wrapper">
                            {toolPage > 0 && (
                                <button
                                    className="tools-arrow tools-arrow-left"
                                    onClick={() => setToolPage((p) => p - 1)}
                                >
                                    ‹
                                </button>
                            )}
                            <div className="tools-grid">
                                {tools.slice(toolPage * 4, toolPage * 4 + 4).map((tool) => {
                                    const toolQuantity =
                                        cartItems.find(
                                            (i) => i.productId === Number(tool.productId),
                                        )?.quantity ?? 0;
                                    const isToolInCart = toolQuantity > 0;

                                    return (
                                        <div
                                            key={tool.productId}
                                            className="homepage-card-wrapper tools-card-animate"
                                        >
                                            <Card style={{ height: '100%' }}>
                                                <Link to={`/product/${tool.productId}`}>
                                                    <Card.Img
                                                        variant="top"
                                                        src={`${IMAGE_URL}/images/${tool.imageUrl}`}
                                                        alt={tool.name}
                                                        loading="lazy"
                                                        className="product-image"
                                                    />
                                                </Link>
                                                <Card.Body className="d-flex flex-column">
                                                    <Link
                                                        to={`/product/${tool.productId}`}
                                                        className="product-link mb-2"
                                                    >
                                                        <Card.Title className="product-name">
                                                            {tool.name}
                                                        </Card.Title>
                                                        <Card.Text className="product-price">
                                                            {tool.price.toLocaleString()} Ft
                                                        </Card.Text>
                                                    </Link>

                                                    {isToolInCart ? (
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div className="quantity-controls d-flex align-items-center">
                                                                <Button
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        updateQuantity(
                                                                            Number(tool.productId),
                                                                            toolQuantity - 1,
                                                                        )
                                                                    }
                                                                    disabled={toolQuantity <= 1}
                                                                >
                                                                    -
                                                                </Button>
                                                                <span className="mx-2">
                                                                    {toolQuantity} db
                                                                </span>
                                                                <Button
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        updateQuantity(
                                                                            Number(tool.productId),
                                                                            toolQuantity + 1,
                                                                        )
                                                                    }
                                                                >
                                                                    +
                                                                </Button>
                                                            </div>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => {
                                                                    removeFromCart(
                                                                        Number(tool.productId),
                                                                    );
                                                                    toast.info(
                                                                        'Termék eltávolítva a kosárból!',
                                                                    );
                                                                }}
                                                            >
                                                                <BsTrash />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            className="cart-button mt-auto"
                                                            variant="success"
                                                            onClick={() => {
                                                                addToCart(Number(tool.productId));
                                                                toast.success(
                                                                    'Sikeresen a kosárba tetted!',
                                                                    {
                                                                        toastId: `tool-cart-${tool.productId}`,
                                                                    },
                                                                );
                                                            }}
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
                            {toolPage < Math.ceil(tools.length / 4) - 1 && (
                                <button
                                    className="tools-arrow tools-arrow-right"
                                    onClick={() => setToolPage((p) => p + 1)}
                                >
                                    ›
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Container>

            <GlobalFooter />
        </>
    );
};

export default OneProductPage;
