import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient, { IMAGE_URL } from '../api/apiClient';
import { toast } from 'react-toastify';
import type { Product } from '../types/Product';
import { Button, Card, Container, Row, Col, Table, Form, Modal } from 'react-bootstrap';
import { BsCartFill, BsTrash, BsPlus, BsDash, BsArrowLeft } from 'react-icons/bs';
import '../styles/CartPageStyle.css';
import useCart from '../store/cartStore';
import type { CartItem } from '../store/cartStore';
import GlobalNavbar from '../components/GlobalNavbar';
import GlobalFooter from '../components/GlobalFooter';
import useAuthStore from '../store/authStore';

const CartPage = () => {
    const [products, setProducts] = useState<Array<Product>>([]);
    const [loading, setLoading] = useState(true);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const totalItems = useCart((state) => state.getTotalItems());
    const userId = useAuthStore((state) => state.user?.userId);
    const [customerData, setCustomerData] = useState({
        userId: userId,
        customerName: '',
        email: '',
        phone: '',
        zipCode: '',
        city: '',
        address: '',
        message: '',
        status: 'pending',
    });
    const deliveryCost = 1500;
    const cartState = useCart();
    const navigate = useNavigate();

    const items = cartState.items;
    const removeFromCart = cartState.removeProduct;
    const updateQuantity = cartState.updateQuantity;
    const clearCart = cartState.clearCart;
    const totalPrice = useCart((state) =>
        state.items.reduce((total, item) => {
            const product = products.find((p) => p.productId === item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0),
    );

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
            .catch(() => toast.error('Sikertelen a termékek betöltése!'))
            .finally(() => setLoading(false));
    }, []);

    const cartItems = useMemo(
        () =>
            items
                .map((item: CartItem) => {
                    const product = products.find((p) => p.productId === item.productId);
                    return {
                        ...item,
                        product: product || null,
                        totalPrice: product ? product.price * item.quantity : 0,
                    };
                })
                .filter((item) => item.product !== null),
        [items, products],
    );

    const handleQuantityChange = (productId: number, newQuantity: number) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
            toast.info('Termék eltávolítva a kosárból!');
        } else {
            updateQuantity(productId, newQuantity);
        }
    };

    const handleRemoveItem = (productId: number) => {
        removeFromCart(productId);
        toast.info('Termék eltávolítva a kosárból!');
    };

    const handleClearCart = () => {
        if (window.confirm('Biztosan ki akarod üríteni a kosarat?')) {
            clearCart();
            toast.info('Kosár kiürítve!');
        }
    };

    const handleCheckout = () => {
        if (items.length === 0) {
            toast.warning('A kosár üres!');
            return;
        }
        setShowCheckoutModal(true);
    };

    const finalTotal = totalPrice >= 15000 ? totalPrice : totalPrice + deliveryCost;

    const handleSubmitOrder = () => {
        const finalTotal = totalPrice >= 15000 ? totalPrice : totalPrice + deliveryCost;

        const orderData = {
            userId: userId || null,
            customerName: customerData.customerName,
            email: customerData.email,
            phoneNumber: customerData.phone,
            postalCode: customerData.zipCode,
            city: customerData.city,
            address: customerData.address,
            message: customerData.message,
            totalAmount: finalTotal,
            status: 'Pending',
            items: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                productPrice: products.find((p) => p.productId === item.productId)?.price || 0,
            })),
        };

        apiClient
            .post('/orders', orderData)
            .then(() => {
                toast.success('Rendelés sikeresen leadva!');
                clearCart();
                setShowCheckoutModal(false);
                setCustomerData({
                    userId: userId,
                    customerName: '',
                    email: '',
                    phone: '',
                    zipCode: '',
                    city: '',
                    address: '',
                    message: '',
                    status: 'pending',
                });
                setTimeout(() => navigate('/'), 2000);
            })
            .catch(() => {
                toast.error('Hiba történt a rendelés leadása során!');
            });
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Betöltés...</span>
                </div>
                <p className="mt-3">Kosár betöltése...</p>
            </Container>
        );
    }

    if (items.length === 0) {
        return (
            <>
                {/* <header className="header-container">
          <div className="header-left">
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <h2 style={{ cursor: "pointer" }}>Virágátirum</h2>
            </Link>
          </div>
          <div className="header-right">
            <Link to="/">
              <Button variant="outline-primary" className="me-2">
                <BsHouse /> Vissza
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="outline-primary">
                <BsCartFill /> Kosár (0)
              </Button>
            </Link>
          </div>
        </header> */}
                <div className="page-wrapper">
                    <GlobalNavbar totalItems={totalItems} />

                    <div className="page-content">
                        {items.length === 0 ? (
                            <Container className="py-5 text-center empty-cart-container">
                                <BsCartFill size={80} className="text-muted mb-4" />
                                <h2 className="mb-3">A kosarad üres</h2>
                                <p className="text-muted mb-4">
                                    Még nincsenek termékek a kosaradban.
                                </p>
                                <Link to="/">
                                    <Button variant="success" size="lg">
                                        <BsArrowLeft className="me-2" />
                                        Vissza a termékekhez
                                    </Button>
                                </Link>
                            </Container>
                        ) : (
                            <Container className="py-4"></Container>
                        )}
                    </div>

                    <GlobalFooter />
                </div>
            </>
        );
    }

    return (
        <>
            <div className="page-wrapper">
                {/* <header className="header-container">
        <div className="header-left">
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <h2 style={{ cursor: "pointer" }}>Virágátirum</h2>
          </Link>
        </div>
        <div className="header-right">
          <Link to="/">
            <Button variant="outline-primary" className="me-2">
              <BsHouse /> Vissza
            </Button>
          </Link>
          <Link to="/cart">
            <Button variant="outline-primary">
              <BsCartFill /> Kosár ({totalItems})
            </Button>
          </Link>
        </div>
      </header> */}
                <GlobalNavbar totalItems={totalItems} />
                <div className="page-content">
                    <Container className="py-4"> <br /> <br />
                        <Row>
                            <Col lg={8}>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2>
                                        <BsCartFill className="me-2" />
                                        Kosaram ({totalItems} termék)
                                    </h2>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={handleClearCart}
                                    >
                                        <BsTrash className="me-1" />
                                        Kosár ürítése
                                    </Button>
                                </div>

                                <div className="cart-items-container">
                                    {cartItems.map((item) => (
                                        <Card key={item.productId} className="mb-3 cart-item-card">
                                            <Card.Body>
                                                <Row className="align-items-center">
                                                    <Col md={3} xs={4}>
                                                        <Link to={`/product/${item.productId}`}>
                                                            <img
                                                                src={`${IMAGE_URL}/images/${item.product?.imageUrl}`}
                                                                alt={item.product?.name}
                                                                className="img-fluid rounded cart-item-image"
                                                            />
                                                        </Link>
                                                    </Col>
                                                    <Col md={6} xs={8}>
                                                        <Link
                                                            to={`/product/${item.productId}`}
                                                            className="text-decoration-none"
                                                        >
                                                            <h5 className="mb-1">
                                                                {item.product?.name}
                                                            </h5>
                                                        </Link>
                                                        <p className="text-muted mb-1">
                                                            {item.product?.price.toLocaleString()}{' '}
                                                            Ft / db
                                                        </p>
                                                        <div className="d-flex align-items-center mt-2">
                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleQuantityChange(
                                                                        item.productId,
                                                                        item.quantity - 1,
                                                                    )
                                                                }
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                <BsDash />
                                                            </Button>
                                                            <Form.Control
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) =>
                                                                    handleQuantityChange(
                                                                        item.productId,
                                                                        parseInt(e.target.value) ||
                                                                            1,
                                                                    )
                                                                }
                                                                className="mx-2 text-center"
                                                                style={{ width: '70px' }}
                                                            />
                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleQuantityChange(
                                                                        item.productId,
                                                                        item.quantity + 1,
                                                                    )
                                                                }
                                                            >
                                                                <BsPlus />
                                                            </Button>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                className="ms-3"
                                                                onClick={() =>
                                                                    handleRemoveItem(item.productId)
                                                                }
                                                            >
                                                                <BsTrash />
                                                            </Button>
                                                        </div>
                                                    </Col>
                                                    <Col md={3} xs={12} className="text-end">
                                                        <div className="mt-md-0 mt-3">
                                                            <h5 className="text-success">
                                                                {(
                                                                    item.totalPrice || 0
                                                                ).toLocaleString()}{' '}
                                                                Ft
                                                            </h5>
                                                            <small className="text-muted">
                                                                {item.quantity} ×{' '}
                                                                {item.product?.price.toLocaleString()}{' '}
                                                                Ft
                                                            </small>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            </Col>

                            <Col lg={4}>
                                <Card className="summary-card">
                                    <Card.Header className="bg-success text-white">
                                        <h5 className="mb-0">Összesítés</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Table borderless>
                                            <tbody>
                                                <tr>
                                                    <td>Termékek összesen:</td>
                                                    <td className="text-end">{totalItems} db</td>
                                                </tr>
                                                <tr>
                                                    <td>Köztes összeg:</td>
                                                    <td className="text-end">
                                                        {totalPrice.toLocaleString()} Ft
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Szállítás:</td>
                                                    <td className="text-end text-success">
                                                        {totalPrice >= 15000
                                                            ? 'INGYENES'
                                                            : `${deliveryCost.toLocaleString()} Ft`}
                                                    </td>
                                                </tr>
                                                <tr className="border-top">
                                                    <th>Végösszeg:</th>
                                                    <th className="text-end h4 text-success">
                                                        {(totalPrice >= 15000
                                                            ? totalPrice
                                                            : totalPrice + deliveryCost
                                                        ).toLocaleString()}
                                                        Ft
                                                    </th>
                                                </tr>
                                            </tbody>
                                        </Table>

                                        <div className="d-grid gap-2">
                                            <Button
                                                variant="success"
                                                size="lg"
                                                onClick={handleCheckout}
                                                className="mb-2"
                                            >
                                                Tovább a rendeléshez
                                            </Button>
                                            <Link to="/">
                                                <Button variant="outline-primary" className="w-100">
                                                    <BsArrowLeft className="me-2" />
                                                    Vásárlás folytatása
                                                </Button>
                                            </Link>
                                        </div>

                                        <div className="mt-4">
                                            <small className="text-muted">
                                                <p className="mb-1">
                                                    ✓ Ingyenes szállítás 15.000 Ft felett
                                                </p>
                                                <p className="mb-1">
                                                    ✓ 30 napos visszatérítési garancia
                                                </p>
                                                <p className="mb-0">✓ Biztonságos fizetés</p>
                                            </small>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                    {}
                    <Modal
                        show={showCheckoutModal}
                        onHide={() => setShowCheckoutModal(false)}
                        size="lg"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Rendelés leadása</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Teljes név *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={customerData.customerName}
                                                onChange={(e) =>
                                                    setCustomerData({
                                                        ...customerData,
                                                        customerName: e.target.value,
                                                    })
                                                }
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email cím *</Form.Label>
                                            <Form.Control
                                                type="email"
                                                value={customerData.email}
                                                onChange={(e) =>
                                                    setCustomerData({
                                                        ...customerData,
                                                        email: e.target.value,
                                                    })
                                                }
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Telefonszám *</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                value={customerData.phone}
                                                onChange={(e) =>
                                                    setCustomerData({
                                                        ...customerData,
                                                        phone: e.target.value,
                                                    })
                                                }
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Irányítószám *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={customerData.zipCode}
                                                onChange={(e) =>
                                                    setCustomerData({
                                                        ...customerData,
                                                        zipCode: e.target.value,
                                                    })
                                                }
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Település *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={customerData.city}
                                        onChange={(e) =>
                                            setCustomerData({
                                                ...customerData,
                                                city: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Utca, házszám *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={customerData.address}
                                        onChange={(e) =>
                                            setCustomerData({
                                                ...customerData,
                                                address: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Üzenet (opcionális)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={customerData.message}
                                        onChange={(e) =>
                                            setCustomerData({
                                                ...customerData,
                                                message: e.target.value,
                                            })
                                        }
                                        placeholder="Egyéb megjegyzések, kérdések..."
                                    />
                                </Form.Group>

                                <div className="border p-3 mb-3 bg-light rounded">
                                    <h6>Rendelés összegzése</h6>
                                    <div className="d-flex justify-content-between">
                                        <span>Termékek ({totalItems} db):</span>
                                        <span>{totalPrice.toLocaleString()} Ft</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>Szállítás:</span>
                                        <span className="text-success">
                                            {totalPrice >= 15000
                                                ? 'INGYENES'
                                                : `${deliveryCost.toLocaleString()} Ft`}
                                        </span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between">
                                        <strong>Végösszeg:</strong>
                                        <strong>
                                            {finalTotal.toLocaleString()}
                                            Ft
                                        </strong>
                                    </div>
                                </div>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowCheckoutModal(false)}>
                                Mégse
                            </Button>
                            <Button variant="success" onClick={handleSubmitOrder}>
                                Rendelés leadása
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
                <br />
                <br />
                <GlobalFooter />
            </div>
        </>
    );
};

export default CartPage;
