import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Container, Modal } from "react-bootstrap";
import { BsBoxArrowRight, BsEye } from "react-icons/bs";
import apiClient, { IMAGE_URL } from "../api/apiClient";
import type { User } from "../types/User";
import "../styles/ProfilePageStyle.css";
import type { Order } from "../types/Order";
import type { OrderItem } from "../types/OrderItem";
import { useAuth } from "../hooks/useAuth";
import useAuthStore from "../store/authStore";

const ProfilePage = () => {
  const [user, setUser] = useState<User>();
  const [modalOrderId, setModalOrderId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<number, OrderItem[]>>({});
  const [openOrderId, setOpenOrderId] = useState<number | null>(null);
  const { logout } = useAuth();
  const userId = useAuthStore((state) => state.user?.userId);
  const navigate = useNavigate();
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    apiClient
      .get("/me")
      .then((res) => setUser(res.data))
      .catch(() => toast.error("Nem sikerült lekérni a profil adatait!"));
  }, []);

  useEffect(() => {
    if (!userId || isLoading) return;

    apiClient
      .get(`/orders/user/${userId}`)
      .then((res) => setOrders(res.data))
      .catch(() => toast.error("Nem sikerült lekérni a rendeléseket!"));
  }, [userId, isLoading]);

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Sikeresen kijelentkeztél!");
  };

  const handleToggleOrder = async (orderId: number) => {
    if (openOrderId === orderId) {
      setOpenOrderId(null);
      return;
    }
    setOpenOrderId(orderId);
    if (orderItems[orderId]) return;
    try {
      const res = await apiClient.get(`/order-items/${orderId}`);
      setOrderItems((prev) => ({ ...prev, [orderId]: res.data }));
    } catch {
      toast.error("Nem sikerült lekérni a rendelés tételeit!");
    }
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("hu-HU", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <Container className="profile-container">
      <button className="back-home-button" onClick={() => navigate("/")}>
        ← Főoldal
      </button>

      <div className="profile-wrapper">
        <div className="profile-greeting">
          <p className="profile-greeting-sub">Üdvözlünk,</p>
          <p className="profile-greeting-name">
            {user?.firstName} {user?.lastName}
          </p>
        </div>

        <div className="profile-card">
          <p className="profile-card-label">SZEMÉLYES ADATOK</p>
          <div className="profile-card-row">
            <span className="profile-card-key">E-mail cím</span>
            <span className="profile-card-value">{user?.email ?? "—"}</span>
          </div>
          <div className="profile-card-row profile-card-row--last">
            <span className="profile-card-key">Regisztráció dátuma</span>
            <span className="profile-card-value">{formattedDate}</span>
          </div>
        </div>

        <div className="profile-card">
          <p className="profile-card-label">RENDELÉSEIM</p>
          {orders.length === 0 ? (
            <p className="profile-empty">Még nincs rendelésed.</p>
          ) : (
            orders.map((order) => (
              <div key={order.orderId} className="profile-order-row">
                <div className="profile-order-left">
                  <span className="profile-order-id">#{order.orderId}</span>
                  <span className="profile-order-date">
                    {new Date(order.orderDate).toLocaleDateString("hu-HU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="profile-order-right">
                  <span
                    className={`profile-order-status profile-order-status--${order.status}`}
                  >
                    {order.status}
                  </span>
                  <span className="profile-order-price">
                    {order.totalAmount} Ft
                  </span>
                </div>
                <BsEye
                  size={16}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleOrder(order.orderId);
                    setModalOrderId(order.orderId);
                  }}
                />
                <Modal
                  show={modalOrderId !== null}
                  onHide={() => setModalOrderId(null)}
                  centered
                  size="lg"
                  scrollable
                >
                  <Modal.Header closeButton>
                    <Modal.Title style={{ fontSize: "16px" }}>
                      #{modalOrderId} rendelés tartalma
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    {modalOrderId && orderItems[modalOrderId]?.[0]?.message && (
                      <div className="profile-modal-message">
                        Üzenet:
                        <p className="profile-card-key">
                          {orderItems[modalOrderId][0].message}
                        </p>
                      </div>
                    )}
                    {modalOrderId && orderItems[modalOrderId]?.length === 0 ? (
                      <p className="profile-empty">Nincsenek tételek.</p>
                    ) : (
                      modalOrderId &&
                      orderItems[modalOrderId]?.map((item) => (
                        <div
                          key={item.orderItemId}
                          className="profile-modal-item"
                        >
                          <img
                            src={`${IMAGE_URL}/images/${item.imageUrl}`}
                            alt={item.name}
                            className="profile-modal-img"
                          />
                          <div className="profile-modal-info">
                            <span className="profile-modal-name">
                              {item.name}
                            </span>
                            <span className="profile-card-key">
                              {item.quantity} db
                            </span>
                          </div>
                          <span className="profile-order-item-price">
                            {item.productPrice} Ft
                          </span>
                        </div>
                      ))
                    )}
                  </Modal.Body>
                </Modal>
              </div>
            ))
          )}
        </div>

        <div className="profile-actions">
          <button className="profile-logout-btn" onClick={handleLogout}>
            <BsBoxArrowRight size={16} />
            Kijelentkezés
          </button>
        </div>
      </div>
    </Container>
  );
};

export default ProfilePage;
