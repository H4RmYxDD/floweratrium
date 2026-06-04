package com.viragatrium;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.TableCellEditor;
import javax.swing.table.TableCellRenderer;
import java.awt.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.util.List;
import java.util.Map;

public class Main extends JFrame {

    private static final String BASE_URL = "http://localhost:3456/api";
    private JTable productTable;
    private DefaultTableModel tableModel;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final Gson gson = new Gson();
    private String authToken = null;
    private int userId = 0;
    private JLabel welcomeLabel;
    private JPanel centerPanel;

    public Main() {
        setTitle("Virágbolt Admin");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(900, 600);
        setLayout(new BorderLayout());

        JMenuBar mb = new JMenuBar();
        JButton m0 = new JButton("Bejelentkezés");

        m0.addActionListener(e -> {
            if (authToken != null) {
                authToken = null;
                userId = 0;
                m0.setText("Bejelentkezés");
                welcomeLabel.setText("Üdvözöljük az admin felületen! Válasszon a menüpontok közül.");
                ((CardLayout) centerPanel.getLayout()).show(centerPanel, "welcome");
                tableModel.setRowCount(0);
                tableModel.setColumnIdentifiers(new String[]{
                        "ID", "Kategória ID", "Név", "Leírás", "Ár (Ft)", "Kép", "Készlet", "Segítség link"
                });
                JOptionPane.showMessageDialog(this, "Sikeres kijelentkezés!");
            } else {
                showLoginDialog(m0);
            }
        });

        JMenu m1 = new JMenu("Felhasználók");
        JMenuItem m11 = new JMenuItem("Összes");
        m1.add(m11);
        m11.addActionListener(e -> fetchData("/users", new String[]{
                "ID", "Vezetéknév", "Keresztnév", "Email", "Szerepkör", "Létrehozva"
        }, user -> new Object[]{
                Main.getInt(user, "userId"),
                user.get("lastName"),
                user.get("firstName"),
                user.get("email"),
                user.get("role"),
                Main.formatDate(user, "createdAt")
        }));

        JMenu m2 = new JMenu("Termékek");
        JMenuItem m21 = new JMenuItem("Összes");
        m2.add(m21);
        m21.addActionListener(e -> fetchData("/products", new String[]{
                "ID", "Kategória ID", "Név", "Leírás", "Ár (Ft)", "Kép", "Készlet", "Segítség link", "Műveletek"
        }, product -> new Object[]{
                Main.getInt(product, "productId"),
                Main.getInt(product, "categoryId"),
                product.get("name"),
                product.get("description"),
                Main.getInt(product, "price"),
                product.get("imageUrl"),
                Main.getInt(product, "stock"),
                product.get("helpLink"),
                ""
        }));

        JMenuItem m22 = new JMenuItem("Hozzáadás");
        m2.add(m22);
        m22.addActionListener(e -> {
            if (authToken == null) {
                JOptionPane.showMessageDialog(this, "Előbb jelentkezz be!");
                return;
            }
            JTextField categoryIdField = new JTextField();
            JTextField nameField       = new JTextField();
            JTextField descField       = new JTextField();
            JTextField priceField      = new JTextField();
            JTextField stockField      = new JTextField();
            JTextField helpLinkField   = new JTextField();

            // Képfeltöltés gomb
            JButton browseBtn = new JButton("Kép választás");
            JLabel imagePathLabel = new JLabel("Nincs kép");
            String[] selectedImagePath = {""};

            browseBtn.addActionListener(ev -> {
                JFileChooser fileChooser = new JFileChooser();
                fileChooser.setFileSelectionMode(JFileChooser.FILES_ONLY);
                fileChooser.setFileFilter(new javax.swing.filechooser.FileNameExtensionFilter(
                        "Képfájlok", "jpg", "jpeg", "png", "gif"
                ));

                int result = fileChooser.showOpenDialog(Main.this);
                if (result == JFileChooser.APPROVE_OPTION) {
                    selectedImagePath[0] = fileChooser.getSelectedFile().getAbsolutePath();
                    imagePathLabel.setText(fileChooser.getSelectedFile().getName());
                }
            });

            JPanel imagePanel = new JPanel(new BorderLayout(5, 0));
            imagePanel.add(browseBtn, BorderLayout.WEST);
            imagePanel.add(imagePathLabel, BorderLayout.CENTER);

            JPanel panel = new JPanel(new GridLayout(7, 2, 8, 8));
            panel.add(new JLabel("Kategória ID:"));  panel.add(categoryIdField);
            panel.add(new JLabel("Név:"));           panel.add(nameField);
            panel.add(new JLabel("Leírás:"));        panel.add(descField);
            panel.add(new JLabel("Ár (Ft):"));       panel.add(priceField);
            panel.add(new JLabel("Kép:"));           panel.add(imagePanel);
            panel.add(new JLabel("Készlet:"));       panel.add(stockField);
            panel.add(new JLabel("Segítség link:")); panel.add(helpLinkField);

            int result = JOptionPane.showConfirmDialog(this, panel, "Termék hozzáadása", JOptionPane.OK_CANCEL_OPTION);
            if (result != JOptionPane.OK_OPTION) return;

            String name = nameField.getText().trim();
            if (name.isEmpty()) {
                JOptionPane.showMessageDialog(this, "A név megadása kötelező!");
                return;
            }
            int categoryId, price, stock;
            try {
                categoryId = Integer.parseInt(categoryIdField.getText().trim());
                price      = Integer.parseInt(priceField.getText().trim());
                stock      = Integer.parseInt(stockField.getText().trim());
            } catch (NumberFormatException ex) {
                JOptionPane.showMessageDialog(this, "Kategória ID, Ár és Készlet egész szám kell legyen!");
                return;
            }

            // Kép feltöltése
            String[] imageUrl = {""};
            if (!selectedImagePath[0].isEmpty()) {
                try {
                    byte[] imageBytes = java.nio.file.Files.readAllBytes(
                            java.nio.file.Paths.get(selectedImagePath[0])
                    );
                    String imageBase64 = java.util.Base64.getEncoder().encodeToString(imageBytes);
                    String filename = new java.io.File(selectedImagePath[0]).getName();

                    String uploadBody = gson.toJson(Map.of(
                            "imageBase64", imageBase64,
                            "filename", filename
                    ));

                    HttpRequest uploadRequest = HttpRequest.newBuilder()
                            .uri(URI.create(BASE_URL + "/upload"))
                            .header("Content-Type", "application/json")
                            .header("Authorization", "Bearer " + authToken)
                            .POST(HttpRequest.BodyPublishers.ofString(uploadBody))
                            .build();
                    HttpResponse<String> uploadResponse = httpClient.send(uploadRequest, HttpResponse.BodyHandlers.ofString());

                    if (uploadResponse.statusCode() == 200 || uploadResponse.statusCode() == 201) {
                        try {
                            Map<String, Object> uploadJson = gson.fromJson(uploadResponse.body(),
                                    new TypeToken<Map<String, Object>>(){}.getType());
                            imageUrl[0] = (String) uploadJson.get("imageUrl");
                            System.out.println("DEBUG - uploadJson: " + uploadJson);
                            System.out.println("DEBUG - imageUrl: " + imageUrl[0]);
                        } catch (Exception parseEx) {
                            System.out.println("DEBUG - Parse error: " + parseEx.getMessage());
                            System.out.println("DEBUG - Response body: " + uploadResponse.body());
                            JOptionPane.showMessageDialog(this, "JSON parse hiba: " + parseEx.getMessage());
                            return;
                        }
                    } else {
                        JOptionPane.showMessageDialog(this, "Képfeltöltés sikertelen! Státusz: " + uploadResponse.statusCode());
                        return;
                    }
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(this, "Hiba a kép feldolgozásakor: " + ex.getMessage());
                    return;
                }
            }

            String body = gson.toJson(Map.of(
                    "categoryId",  categoryId,
                    "name",        name,
                    "description", descField.getText().trim(),
                    "price",       price,
                    "imageUrl",    imageUrl[0],
                    "stock",       stock,
                    "helpLink",    helpLinkField.getText().trim()
            ));
            postData("/products", body, () ->
                    fetchData("/products", new String[]{
                            "ID", "Kategória ID", "Név", "Leírás", "Ár (Ft)", "Kép", "Készlet", "Segítség link", "Műveletek"
                    }, product -> new Object[]{
                            Main.getInt(product, "productId"),
                            Main.getInt(product, "categoryId"),
                            product.get("name"),
                            product.get("description"),
                            Main.getInt(product, "price"),
                            product.get("imageUrl"),
                            Main.getInt(product, "stock"),
                            product.get("helpLink"),
                            ""
                    })
            );
        });

        JMenu m3 = new JMenu("Kategóriák");
        JMenuItem m31 = new JMenuItem("Összes");
        m3.add(m31);
        m31.addActionListener(e -> fetchData("/categories", new String[]{
                "ID", "Név", "Műveletek"
        }, category -> new Object[]{
                Main.getInt(category, "categoryId"),
                category.get("name"),
                ""
        }));

        JMenuItem m32 = new JMenuItem("Hozzáadás");
        m3.add(m32);
        m32.addActionListener(e -> {
            JTextField nameField = new JTextField(10);
            JPanel panel = new JPanel(new GridLayout(1, 1, 8, 8));
            panel.add(new JLabel("Kategória neve: "));
            panel.add(nameField);

            int result = JOptionPane.showConfirmDialog(this, panel, "Kategória hozzáadása", JOptionPane.OK_CANCEL_OPTION);
            if (result != JOptionPane.OK_OPTION) return;

            String body = gson.toJson(Map.of("name", nameField.getText()));
            postData("/categories", body, () ->
                    fetchData("/categories", new String[]{"ID", "Név", "Műveletek"}, category -> new Object[]{
                            Main.getInt(category, "categoryId"),
                            category.get("name"),
                            ""
                    })
            );
        });

        JMenu m4 = new JMenu("Üzenetek");
        JMenuItem m41 = new JMenuItem("Beszélgetések");
        m4.add(m41);
        m41.addActionListener(e -> fetchData("/threads", new String[]{
                "ID", "Felhasználó", "Utolsó üzenet", "Műveletek"
        }, thread -> new Object[]{
                Main.getInt(thread, "threadId"),
                thread.get("otherUserName"),
                thread.get("lastMessage"),
                ""
        }));


        JMenu m5 = new JMenu("Rendelések");
        JMenuItem m51 = new JMenuItem("Összes");
        m5.add(m51);
        m51.addActionListener(e -> fetchData("/orders", new String[]{
                "ID", "Felhasználó ID", "Vásárló neve", "Email", "Telefon", "Irányítószám", "Város", "Cím", "Üzenet", "Összeg (Ft)", "Státusz", "Dátum", "Tételek"
        }, order -> new Object[]{
                Main.getInt(order, "orderId"),
                Main.getInt(order, "userId"),
                order.get("customerName"),
                order.get("email"),
                order.get("phoneNumber"),
                order.get("postalCode"),
                order.get("city"),
                order.get("address"),
                order.get("message"),
                Main.getInt(order, "totalAmount"),
                order.get("status"),
                Main.formatDate(order, "orderDate"),
                ""
        }));

        JMenu m6 = new JMenu("Riportok");

        JMenuItem r1 = new JMenuItem("Bevétel (napi)");
        JMenuItem r2 = new JMenuItem("Bevétel (heti)");
        JMenuItem r3 = new JMenuItem("Bevétel (havi)");
        JMenuItem r4 = new JMenuItem("Top 5 termék / kategória");

        m6.add(r1);
        m6.add(r2);
        m6.add(r3);
        m6.add(r4);

        r1.addActionListener(e -> fetchReport("/reports/revenue/daily",
                new String[]{"Nap", "Bevétel"},
                item -> new Object[]{
                        item.get("date"),
                        Main.getInt(item, "revenue")
                }));

        r2.addActionListener(e -> fetchReport("/reports/revenue/weekly",
                new String[]{"Hét", "Bevétel"},
                item -> new Object[]{
                        item.get("week"),
                        Main.getInt(item, "revenue")
                }));

        r3.addActionListener(e -> fetchReport("/reports/revenue/monthly",
                new String[]{"Hónap", "Bevétel"},
                item -> new Object[]{
                        item.get("month"),
                        Main.getInt(item, "revenue")
                }));

        r4.addActionListener(e -> fetchReport("/reports/top-products-by-category",
                new String[]{"Riport"},
                item -> {

                    String categoryName = (String) item.get("categoryName");
                    if (categoryName == null) categoryName = "Ismeretlen kategória";

                    List<Map<String, Object>> products =
                            (List<Map<String, Object>>) item.get("products");

                    StringBuilder out = new StringBuilder();

                    out.append("📁 ").append(categoryName).append("\n");

                    if (products != null) {
                        for (Map<String, Object> p : products) {
                            out.append("   └ ")
                                    .append(p.get("productName"))
                                    .append(" - ")
                                    .append(getInt(p, "totalSold"))
                                    .append(" db\n");
                        }
                    }

                    return new Object[]{out.toString()};
                }));
        mb.add(m0); mb.add(m1); mb.add(m2); mb.add(m3); mb.add(m4); mb.add(m5); mb.add(m6);
        add(mb, BorderLayout.NORTH);

        String[] columns = {"ID", "Kategória ID", "Név", "Leírás", "Ár (Ft)", "Kép", "Készlet", "Segítség link"};
        tableModel = new DefaultTableModel(columns, 0);
        productTable = new JTable(tableModel);
        productTable.setDefaultRenderer(Object.class, new MultiLineRenderer());        productTable.setAutoResizeMode(JTable.AUTO_RESIZE_ALL_COLUMNS);

        JPanel welcomePanel = new JPanel(new BorderLayout());
        welcomeLabel = new JLabel("Üdvözöljük az admin felületen! Válasszon a menüpontok közül.", SwingConstants.CENTER);
        welcomeLabel.setFont(new Font("Arial", Font.PLAIN, 16));
        welcomeLabel.setForeground(new Color(80, 80, 80));
        welcomePanel.add(welcomeLabel, BorderLayout.CENTER);
        welcomePanel.setBackground(new Color(245, 245, 245));

        centerPanel = new JPanel(new CardLayout());
        centerPanel.add(welcomePanel, "welcome");
        centerPanel.add(new JScrollPane(productTable), "table");
        add(centerPanel, BorderLayout.CENTER);
    }

    private void fetchData(String endpoint, String[] columns, RowMapper mapper) {
        if (authToken == null) {
            JOptionPane.showMessageDialog(this, "Előbb jelentkezz be!");
            return;
        }
        
        ((CardLayout) centerPanel.getLayout()).show(centerPanel, "table");
        tableModel.setColumnIdentifiers(columns);
        tableModel.setRowCount(0);
        setCursor(Cursor.getPredefinedCursor(Cursor.WAIT_CURSOR));
        new ApiWorker(endpoint, mapper, () -> {
            int lastCol = productTable.getColumnCount() - 1;
            String lastColName = tableModel.getColumnName(lastCol);
            if (endpoint.contains("/orders")) {
                productTable.getColumnModel().getColumn(10).setCellRenderer(new StatusRenderer());
                productTable.getColumnModel().getColumn(10).setCellEditor(new OrderStatusEditor());
                productTable.setRowHeight(36);
                productTable.getColumnModel().getColumn(lastCol).setCellRenderer(new OrderButtonRenderer());
                productTable.getColumnModel().getColumn(lastCol).setCellEditor(new OrderButtonEditor());
                productTable.getColumnModel().getColumn(lastCol).setMinWidth(90);
                productTable.getColumnModel().getColumn(lastCol).setPreferredWidth(90);
            } else if (lastColName.equals("Műveletek")) {
                if (endpoint.contains("/threads")) {
                    productTable.getColumnModel().getColumn(lastCol).setCellRenderer(new ThreadButtonRenderer());
                    productTable.getColumnModel().getColumn(lastCol).setCellEditor(new ThreadButtonEditor());
                } else {
                    productTable.getColumnModel().getColumn(lastCol).setCellRenderer(new ButtonRenderer());
                    if (endpoint.contains("/products")) {
                        productTable.getColumnModel().getColumn(lastCol).setCellEditor(new ProductButtonEditor());
                    } else {
                        productTable.getColumnModel().getColumn(lastCol).setCellEditor(new ButtonEditor());
                    }
                }
                productTable.setRowHeight(36);
                productTable.getColumnModel().getColumn(lastCol).setMinWidth(120);
                productTable.getColumnModel().getColumn(lastCol).setPreferredWidth(120);
            }
        }).execute();
    }

    private void fetchReport(String endpoint, String[] columns, RowMapper mapper) {
        fetchData(endpoint, columns, mapper);
    }

    @FunctionalInterface
    interface RowMapper {
        Object[] map(Map<String, Object> item);
    }

    private class ApiWorker extends SwingWorker<Void, Void> {
        private final String endpoint;
        private final RowMapper mapper;
        private String responseBody;
        private int statusCode;
        private final Runnable onDone;

        ApiWorker(String endpoint, RowMapper mapper, Runnable onDone) {
            this.endpoint = endpoint;
            this.mapper   = mapper;
            this.onDone   = onDone;
        }

        @Override
        protected Void doInBackground() throws Exception {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + endpoint))
                    .GET();
            if (authToken != null) {
                builder.header("Authorization", "Bearer " + authToken);
            }
            HttpRequest request = builder.build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            statusCode   = response.statusCode();
            responseBody = response.body();
            return null;
        }

        @Override
        protected void done() {
            try {
                if (statusCode == 200 && !responseBody.isEmpty()) {
                    java.lang.reflect.Type listType = new TypeToken<List<Map<String, Object>>>(){}.getType();
                    List<Map<String, Object>> items = gson.fromJson(responseBody, listType);
                    tableModel.setRowCount(0);
                    for (Map<String, Object> item : items) {
                        tableModel.addRow(mapper.map(item));
                    }
                } else {
                    JOptionPane.showMessageDialog(Main.this, "Hiba: " + statusCode);
                }
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(Main.this, "Error: " + ex.getMessage());
            } finally {
                setCursor(Cursor.getDefaultCursor());
                if (onDone != null) SwingUtilities.invokeLater(onDone);
            }
        }
    }

    private class ButtonRenderer extends JPanel implements TableCellRenderer {
        private final JButton editBtn   = new JButton("Szerk");
        private final JButton deleteBtn = new JButton("Törlés");

        ButtonRenderer() {
            setLayout(new GridLayout(1, 2, 2, 0));
            editBtn.setFont(editBtn.getFont().deriveFont(10f));
            deleteBtn.setFont(deleteBtn.getFont().deriveFont(10f));
            editBtn.setBackground(Color.YELLOW);
            editBtn.setOpaque(true);
            editBtn.setMargin(new Insets(0, 2, 0, 2));
            deleteBtn.setForeground(Color.RED);
            deleteBtn.setMargin(new Insets(0, 2, 0, 2));
            add(editBtn);
            add(deleteBtn);
        }

        @Override
        public Component getTableCellRendererComponent(
                JTable table, Object value, boolean isSelected, boolean hasFocus, int row, int column) {
            return this;
        }
    }

    private class ProductButtonEditor extends AbstractCellEditor implements TableCellEditor {
        private final JPanel  panel     = new JPanel(new GridLayout(1, 2, 2, 0));
        private final JButton editBtn   = new JButton("Szerk");
        private final JButton deleteBtn = new JButton("Törlés");
        private int currentRow;

        ProductButtonEditor() {
            editBtn.setFont(editBtn.getFont().deriveFont(10f));
            deleteBtn.setFont(deleteBtn.getFont().deriveFont(10f));
            editBtn.setBackground(Color.YELLOW);
            editBtn.setOpaque(true);
            editBtn.setMargin(new Insets(0, 2, 0, 2));
            deleteBtn.setForeground(Color.RED);
            deleteBtn.setMargin(new Insets(0, 2, 0, 2));
            panel.add(editBtn);
            panel.add(deleteBtn);

            editBtn.addActionListener(e -> {
                fireEditingStopped();
                int    productId   = (int)    tableModel.getValueAt(currentRow, 0);
                int    categoryId  = (int)    tableModel.getValueAt(currentRow, 1);
                String name        = (String) tableModel.getValueAt(currentRow, 2);
                String description = (String) tableModel.getValueAt(currentRow, 3);
                int    price       = (int)    tableModel.getValueAt(currentRow, 4);
                String imageUrl    = (String) tableModel.getValueAt(currentRow, 5);
                int    stock       = (int)    tableModel.getValueAt(currentRow, 6);
                String helpLink    = (String) tableModel.getValueAt(currentRow, 7);

                JTextField categoryIdField = new JTextField(String.valueOf(categoryId));
                JTextField nameField       = new JTextField(name);
                JTextField descField       = new JTextField(description);
                JTextField priceField      = new JTextField(String.valueOf(price));
                JTextField imageUrlField   = new JTextField(imageUrl);
                JTextField stockField      = new JTextField(String.valueOf(stock));
                JTextField helpLinkField   = new JTextField(helpLink);

                JPanel inputPanel = new JPanel(new GridLayout(7, 2, 8, 8));
                inputPanel.add(new JLabel("Kategória ID:"));  inputPanel.add(categoryIdField);
                inputPanel.add(new JLabel("Név:"));           inputPanel.add(nameField);
                inputPanel.add(new JLabel("Leírás:"));        inputPanel.add(descField);
                inputPanel.add(new JLabel("Ár (Ft):"));       inputPanel.add(priceField);
                inputPanel.add(new JLabel("Kép URL:"));       inputPanel.add(imageUrlField);
                inputPanel.add(new JLabel("Készlet:"));       inputPanel.add(stockField);
                inputPanel.add(new JLabel("Segítség link:")); inputPanel.add(helpLinkField);

                int result = JOptionPane.showConfirmDialog(Main.this, inputPanel,
                        "Termék szerkesztése (#" + productId + ")", JOptionPane.OK_CANCEL_OPTION);
                if (result != JOptionPane.OK_OPTION) return;

                String newName = nameField.getText().trim();
                if (newName.isEmpty()) {
                    JOptionPane.showMessageDialog(Main.this, "A név megadása kötelező!");
                    return;
                }
                int newCategoryId, newPrice, newStock;
                try {
                    newCategoryId = Integer.parseInt(categoryIdField.getText().trim());
                    newPrice      = Integer.parseInt(priceField.getText().trim());
                    newStock      = Integer.parseInt(stockField.getText().trim());
                } catch (NumberFormatException ex) {
                    JOptionPane.showMessageDialog(Main.this, "Kategória ID, Ár és Készlet egész szám kell legyen!");
                    return;
                }

                String body = gson.toJson(Map.of(
                        "categoryId",  newCategoryId,
                        "name",        newName,
                        "description", descField.getText().trim(),
                        "price",       newPrice,
                        "imageUrl",    imageUrlField.getText().trim(),
                        "stock",       newStock,
                        "helpLink",    helpLinkField.getText().trim()
                ));
                putData("/products/" + productId, body, () ->
                        fetchData("/products", new String[]{
                                "ID", "Kategória ID", "Név", "Leírás", "Ár (Ft)", "Kép", "Készlet", "Segítség link", "Műveletek"
                        }, product2 -> new Object[]{
                                Main.getInt(product2, "productId"),
                                Main.getInt(product2, "categoryId"),
                                product2.get("name"),
                                product2.get("description"),
                                Main.getInt(product2, "price"),
                                product2.get("imageUrl"),
                                Main.getInt(product2, "stock"),
                                product2.get("helpLink"),
                                ""
                        })
                );
            });

            deleteBtn.addActionListener(e -> {
                fireEditingStopped();
                int productId = (int) tableModel.getValueAt(currentRow, 0);

                int result = JOptionPane.showConfirmDialog(Main.this,
                        "Biztosan törlöd a terméket?", "Törlés", JOptionPane.YES_NO_OPTION);
                if (result != JOptionPane.YES_OPTION) return;

                deleteData("/products/" + productId, () ->
                        fetchData("/products", new String[]{
                                "ID", "Kategória ID", "Név", "Leírás", "Ár (Ft)", "Kép", "Készlet", "Segítség link", "Műveletek"
                        }, product2 -> new Object[]{
                                Main.getInt(product2, "productId"),
                                Main.getInt(product2, "categoryId"),
                                product2.get("name"),
                                product2.get("description"),
                                Main.getInt(product2, "price"),
                                product2.get("imageUrl"),
                                Main.getInt(product2, "stock"),
                                product2.get("helpLink"),
                                ""
                        })
                );
            });
        }

        @Override
        public Component getTableCellEditorComponent(
                JTable table, Object value, boolean isSelected, int row, int column) {
            currentRow = row;
            return panel;
        }

        @Override
        public Object getCellEditorValue() { return ""; }
    }

    private class ButtonEditor extends AbstractCellEditor implements TableCellEditor {
        private final JPanel  panel     = new JPanel(new GridLayout(1, 2, 2, 0));
        private final JButton editBtn   = new JButton("Szerk");
        private final JButton deleteBtn = new JButton("Törlés");
        private int currentRow;

        ButtonEditor() {
            editBtn.setFont(editBtn.getFont().deriveFont(10f));
            deleteBtn.setFont(deleteBtn.getFont().deriveFont(10f));
            editBtn.setBackground(Color.YELLOW);
            editBtn.setOpaque(true);
            editBtn.setMargin(new Insets(0, 2, 0, 2));
            deleteBtn.setForeground(Color.RED);
            deleteBtn.setMargin(new Insets(0, 2, 0, 2));
            panel.add(editBtn);
            panel.add(deleteBtn);

            editBtn.addActionListener(e -> {
                fireEditingStopped();
                int    categoryId   = (int)    tableModel.getValueAt(currentRow, 0);
                String currentName  = (String) tableModel.getValueAt(currentRow, 1);

                JTextField nameField = new JTextField(currentName);
                JPanel inputPanel = new JPanel(new GridLayout(1, 2, 8, 8));
                inputPanel.add(new JLabel("Új név:"));
                inputPanel.add(nameField);

                int result = JOptionPane.showConfirmDialog(Main.this, inputPanel,
                        "Kategória szerkesztése", JOptionPane.OK_CANCEL_OPTION);
                if (result != JOptionPane.OK_OPTION) return;

                String body = gson.toJson(Map.of("name", nameField.getText()));
                putData("/categories/" + categoryId, body, () ->
                        fetchData("/categories", new String[]{"ID", "Név", "Műveletek"}, category -> new Object[]{
                                Main.getInt(category, "categoryId"),
                                category.get("name"),
                                ""
                        })
                );
            });

            deleteBtn.addActionListener(e -> {
                fireEditingStopped();
                int categoryId = (int) tableModel.getValueAt(currentRow, 0);

                int result = JOptionPane.showConfirmDialog(Main.this,
                        "Biztosan törlöd a kategóriát?", "Törlés", JOptionPane.YES_NO_OPTION);
                if (result != JOptionPane.YES_OPTION) return;

                deleteData("/categories/" + categoryId, () ->
                        fetchData("/categories", new String[]{"ID", "Név", "Műveletek"}, category -> new Object[]{
                                Main.getInt(category, "categoryId"),
                                category.get("name"),
                                ""
                        })
                );
            });
        }

        @Override
        public Component getTableCellEditorComponent(
                JTable table, Object value, boolean isSelected, int row, int column) {
            currentRow = row;
            return panel;
        }

        @Override
        public Object getCellEditorValue() { return ""; }
    }

    private void showOrderItemsDialog(int orderId) {
        if (authToken == null) {
            JOptionPane.showMessageDialog(Main.this, "Előbb jelentkezz be!");
            return;
        }
        new SwingWorker<List<Map<String, Object>>, Void>() {
            @Override
            protected List<Map<String, Object>> doInBackground() throws Exception {
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(BASE_URL + "/order-items/" + orderId))
                        .header("Authorization", "Bearer " + authToken)
                        .GET()
                        .build();
                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() == 200) {
                    return gson.fromJson(response.body(), new TypeToken<List<Map<String, Object>>>(){}.getType());
                }
                return List.of();
            }

            @Override
            protected void done() {
                try {
                    List<Map<String, Object>> items = get();
                    JDialog dialog = new JDialog(Main.this, "Rendelés #" + orderId + " tételei", true);
                    dialog.setSize(500, 300);
                    dialog.setLocationRelativeTo(Main.this);
                    dialog.setLayout(new BorderLayout());

                    String[] cols = {"Termék neve", "Mennyiség", "Egységár"};
                    DefaultTableModel model = new DefaultTableModel(cols, 0);
                    for (Map<String, Object> item : items) {
                        model.addRow(new Object[]{
                                item.get("name"),
                                Main.getInt(item, "quantity"),
                                Main.getInt(item, "productPrice") + " Ft"
                        });
                    }

                    JTable table = new JTable(model);
                    dialog.add(new JScrollPane(table), BorderLayout.CENTER);

                    JButton closeBtn = new JButton("Bezárás");
                    closeBtn.addActionListener(ev -> dialog.dispose());
                    JPanel bottom = new JPanel();
                    bottom.add(closeBtn);
                    dialog.add(bottom, BorderLayout.SOUTH);
                    dialog.setVisible(true);
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(Main.this, "Hiba: " + ex.getMessage());
                }
            }
        }.execute();
    }

    private void showThreadMessagesDialog(int threadId) {
        if (authToken == null) {
            JOptionPane.showMessageDialog(Main.this, "Előbb jelentkezz be!");
            return;
        }
        new SwingWorker<List<Map<String, Object>>, Void>() {
            private int receiverId = 0;
            @Override
            protected List<Map<String, Object>> doInBackground() throws Exception {
                try {
                    HttpRequest threadRequest = HttpRequest.newBuilder()
                            .uri(URI.create(BASE_URL + "/threads"))
                            .header("Authorization", "Bearer " + authToken)
                            .GET()
                            .build();
                    HttpResponse<String> threadResponse = httpClient.send(threadRequest, HttpResponse.BodyHandlers.ofString());

                    if (threadResponse.statusCode() == 200) {
                        List<Map<String, Object>> threads = gson.fromJson(threadResponse.body(),
                                new TypeToken<List<Map<String, Object>>>(){}.getType());
                        for (Map<String, Object> thread : threads) {
                            if (Main.getInt(thread, "threadId") == threadId) {
                                receiverId = Main.getInt(thread, "otherUserId");
                                break;
                            }
                        }
                    }
                } catch (Exception ex) {
                    System.err.println("Error fetching receiverId: " + ex.getMessage());
                }
                
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(BASE_URL + "/messages/" + threadId))
                        .header("Authorization", "Bearer " + authToken)
                        .GET()
                        .build();
                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() == 200) {
                    return gson.fromJson(response.body(), new TypeToken<List<Map<String, Object>>>(){}.getType());
                }
                return List.of();
            }

            @Override
            protected void done() {
                try {
                    List<Map<String, Object>> messages = get();
                    JDialog dialog = new JDialog(Main.this, "Beszélgetés #" + threadId, true);
                    dialog.setSize(600, 500);
                    dialog.setLocationRelativeTo(Main.this);
                    dialog.setLayout(new BorderLayout(5, 5));

                    JPanel messagesPanel = new JPanel();
                    messagesPanel.setLayout(new BoxLayout(messagesPanel, BoxLayout.Y_AXIS));
                    messagesPanel.setBackground(Color.WHITE);

                    for (Map<String, Object> msg : messages) {
                        JLabel msgLabel = new JLabel((String) msg.get("content"));
                        msgLabel.setOpaque(true);
                        msgLabel.setBorder(BorderFactory.createEmptyBorder(8, 12, 8, 12));

                        if (Main.getInt(msg, "senderId") == userId) {
                            msgLabel.setBackground(new Color(173, 216, 230));
                            msgLabel.setAlignmentX(Component.RIGHT_ALIGNMENT);
                        } else {
                            msgLabel.setBackground(new Color(230, 230, 230));
                            msgLabel.setAlignmentX(Component.LEFT_ALIGNMENT);
                        }
                        messagesPanel.add(msgLabel);
                        messagesPanel.add(Box.createVerticalStrut(5));
                    }

                    JScrollPane scrollPane = new JScrollPane(messagesPanel);
                    dialog.add(scrollPane, BorderLayout.CENTER);

                    JPanel bottomPanel = new JPanel(new BorderLayout(5, 5));
                    bottomPanel.setBorder(BorderFactory.createEmptyBorder(5, 5, 5, 5));
                    JTextField msgField = new JTextField();
                    JButton sendBtn = new JButton("Küldés");

                    sendBtn.addActionListener(ev -> {
                        String content = msgField.getText().trim();
                        if (content.isEmpty()) return;

                        String body = gson.toJson(Map.of(
                                "senderId", userId,
                                "receiverId", receiverId,
                                "threadId", threadId,
                                "content", content
                        ));
                        postData("/messages", body, () -> {
                            msgField.setText("");
                            JLabel newMsg = new JLabel(content);
                            newMsg.setOpaque(true);
                            newMsg.setBorder(BorderFactory.createEmptyBorder(8, 12, 8, 12));
                            newMsg.setBackground(new Color(173, 216, 230));
                            newMsg.setAlignmentX(Component.RIGHT_ALIGNMENT);
                            messagesPanel.add(newMsg);
                            messagesPanel.add(Box.createVerticalStrut(5));
                            messagesPanel.revalidate();
                            messagesPanel.repaint();
                            scrollPane.getVerticalScrollBar().setValue(
                                    scrollPane.getVerticalScrollBar().getMaximum()
                            );
                        });
                    });

                    bottomPanel.add(msgField, BorderLayout.CENTER);
                    bottomPanel.add(sendBtn, BorderLayout.EAST);
                    dialog.add(bottomPanel, BorderLayout.SOUTH);

                    dialog.setVisible(true);
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(Main.this, "Hiba: " + ex.getMessage());
                }
            }
        }.execute();
    }

    private class OrderButtonRenderer extends JPanel implements TableCellRenderer {
        private final JButton itemsBtn = new JButton("Tételek");

        OrderButtonRenderer() {
            setLayout(new FlowLayout(FlowLayout.CENTER, 4, 2));
            itemsBtn.setFont(itemsBtn.getFont().deriveFont(11f));
            add(itemsBtn);
        }

        @Override
        public Component getTableCellRendererComponent(JTable table, Object value,
                                                       boolean isSelected, boolean hasFocus, int row, int column) {
            return this;
        }
    }

    private class OrderButtonEditor extends AbstractCellEditor implements TableCellEditor {
        private final JPanel  panel    = new JPanel(new FlowLayout(FlowLayout.CENTER, 4, 2));
        private final JButton itemsBtn = new JButton("Tételek");
        private int currentRow;

        OrderButtonEditor() {
            itemsBtn.setFont(itemsBtn.getFont().deriveFont(11f));
            panel.add(itemsBtn);

            itemsBtn.addActionListener(e -> {
                fireEditingStopped();
                int orderId = (int) tableModel.getValueAt(currentRow, 0);
                showOrderItemsDialog(orderId);
            });
        }

        @Override
        public Component getTableCellEditorComponent(JTable table, Object value,
                                                     boolean isSelected, int row, int column) {
            currentRow = row;
            return panel;
        }

        @Override
        public Object getCellEditorValue() { return ""; }
    }

    private void showLoginDialog(JButton loginBtn) {
        JTextField emailField = new JTextField(20);
        JPasswordField passwordField = new JPasswordField(20);

        JPanel panel = new JPanel(new GridLayout(2, 2, 8, 8));
        panel.add(new JLabel("Email:"));
        panel.add(emailField);
        panel.add(new JLabel("Jelszó:"));
        panel.add(passwordField);

        int result = JOptionPane.showConfirmDialog(this, panel, "Bejelentkezés", JOptionPane.OK_CANCEL_OPTION);
        if (result != JOptionPane.OK_OPTION) return;

        String email = emailField.getText();
        String password = new String(passwordField.getPassword());

        try {
            String body = gson.toJson(Map.of("email", email, "password", password));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/login"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                Map<String, Object> json = gson.fromJson(response.body(),
                        new TypeToken<Map<String, Object>>(){}.getType());
                authToken = (String) json.get("token");

                Map<String, Object> user = (Map<String, Object>) json.get("user");
                String role = (String) user.get("role");
                this.userId = Main.getInt(user, "userId");

                if (!"Admin".equals(role)) {
                    authToken = null;
                    JOptionPane.showMessageDialog(this, "Nincs admin jogosultságod!");
                    return;
                }
                loginBtn.setText("Kijelentkezés");
                String firstName = (String) user.get("firstName");
                String lastName  = (String) user.get("lastName");
                welcomeLabel.setText("Üdvözöljük, " + lastName + " " + firstName + "! Válasszon a menüpontok közül.");
                JOptionPane.showMessageDialog(this, "Sikeres bejelentkezés!");
            } else {
                JOptionPane.showMessageDialog(this, "Hibás email vagy jelszó!");
            }
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "Hiba: " + ex.getMessage());
        }
    }

    private void postData(String endpoint, String jsonBody, Runnable onSuccess) {
        if (authToken == null) {
            JOptionPane.showMessageDialog(this, "Előbb jelentkezz be!");
            return;
        }

        new SwingWorker<Integer, Void>() {
            String responseBody;
            @Override
            protected Integer doInBackground() throws Exception {
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(BASE_URL + endpoint))
                        .header("Content-Type", "application/json")
                        .header("Authorization", "Bearer " + authToken)
                        .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                        .build();
                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                responseBody = response.body();
                return response.statusCode();
            }
            @Override
            protected void done() {
                try {
                    int status = get();
                    if (status == 200 || status == 201) {
                        JOptionPane.showMessageDialog(Main.this, "Sikeres mentés!");
                        if (onSuccess != null) onSuccess.run();
                    } else {
                        JOptionPane.showMessageDialog(Main.this, "Hiba: " + status + " - " + responseBody);
                    }
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(Main.this, "Hiba: " + ex.getMessage());
                }
            }
        }.execute();
    }

    private void putData(String endpoint, String jsonBody, Runnable onSuccess) {
        if (authToken == null) {
            JOptionPane.showMessageDialog(this, "Előbb jelentkezz be!");
            return;
        }

        new SwingWorker<Integer, Void>() {
            String responseBody;
            @Override
            protected Integer doInBackground() throws Exception {
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(BASE_URL + endpoint))
                        .header("Content-Type", "application/json")
                        .header("Authorization", "Bearer " + authToken)
                        .PUT(HttpRequest.BodyPublishers.ofString(jsonBody))
                        .build();
                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                responseBody = response.body();
                return response.statusCode();
            }
            @Override
            protected void done() {
                try {
                    int status = get();
                    if (status == 200 || status == 201) { onSuccess.run(); }
                    else { JOptionPane.showMessageDialog(Main.this, "Hiba: " + status + " - " + responseBody); }
                } catch (Exception ex) { JOptionPane.showMessageDialog(Main.this, "Hiba: " + ex.getMessage()); }
            }
        }.execute();
    }

    private void deleteData(String endpoint, Runnable onSuccess) {
        if (authToken == null) { JOptionPane.showMessageDialog(this, "Előbb jelentkezz be!"); return; }
        new SwingWorker<Integer, Void>() {
            String responseBody;
            @Override
            protected Integer doInBackground() throws Exception {
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(BASE_URL + endpoint))
                        .header("Authorization", "Bearer " + authToken)
                        .DELETE()
                        .build();
                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                responseBody = response.body();
                return response.statusCode();
            }
            @Override
            protected void done() {
                try {
                    int status = get();
                    if (status == 200) { onSuccess.run(); }
                    else { JOptionPane.showMessageDialog(Main.this, "Hiba: " + status + " - " + responseBody); }
                } catch (Exception ex) { JOptionPane.showMessageDialog(Main.this, "Hiba: " + ex.getMessage()); }
            }
        }.execute();
    }

    private class OrderStatusEditor extends AbstractCellEditor implements TableCellEditor {
        private final JComboBox<String> statusCombo = new JComboBox<>(new String[]{
                "Pending", "Processing", "Shipped", "Delivered", "Cancelled"
        });

        OrderStatusEditor() {
            statusCombo.addActionListener(e -> {
                int row = productTable.getEditingRow();
                if (row == -1) return;
                fireEditingStopped();

                int    orderId        = (int)    tableModel.getValueAt(row, 0);
                String selectedStatus = (String) statusCombo.getSelectedItem();

                String body = gson.toJson(Map.of("status", selectedStatus));
                putData("/orders/" + orderId + "/status", body, () ->
                        fetchData("/orders", new String[]{
                                "ID", "Felhasználó ID", "Vásárló neve", "Email", "Telefon", "Irányítószám",
                                "Város", "Cím", "Üzenet", "Összeg (Ft)", "Státusz", "Dátum", "Tételek"
                        }, order -> new Object[]{
                                Main.getInt(order, "orderId"),
                                Main.getInt(order, "userId"),
                                order.get("customerName"),
                                order.get("email"),
                                order.get("phoneNumber"),
                                order.get("postalCode"),
                                order.get("city"),
                                order.get("address"),
                                order.get("message"),
                                Main.getInt(order, "totalAmount"),
                                order.get("status"),
                                Main.formatDate(order, "orderDate"),
                                ""
                        })
                );
            });
        }

        @Override
        public Component getTableCellEditorComponent(
                JTable table, Object value, boolean isSelected, int row, int column) {
            statusCombo.setSelectedItem(value);
            return statusCombo;
        }

        @Override
        public Object getCellEditorValue() { return statusCombo.getSelectedItem(); }
    }

    private class ThreadButtonRenderer extends JPanel implements TableCellRenderer {
        private final JButton openBtn = new JButton("Megnyitás");

        ThreadButtonRenderer() {
            setLayout(new FlowLayout(FlowLayout.CENTER, 4, 2));
            openBtn.setFont(openBtn.getFont().deriveFont(11f));
            add(openBtn);
        }

        @Override
        public Component getTableCellRendererComponent(JTable table, Object value,
                                                       boolean isSelected, boolean hasFocus, int row, int column) {
            return this;
        }
    }

    private class ThreadButtonEditor extends AbstractCellEditor implements TableCellEditor {
        private final JPanel panel = new JPanel(new FlowLayout(FlowLayout.CENTER, 4, 2));
        private final JButton openBtn = new JButton("Megnyitás");
        private int currentRow;

        ThreadButtonEditor() {
            openBtn.setFont(openBtn.getFont().deriveFont(11f));
            panel.add(openBtn);

            openBtn.addActionListener(e -> {
                fireEditingStopped();
                int threadId = (int) tableModel.getValueAt(currentRow, 0);
                showThreadMessagesDialog(threadId);
            });
        }

        @Override
        public Component getTableCellEditorComponent(JTable table, Object value,
                                                     boolean isSelected, int row, int column) {
            currentRow = row;
            return panel;
        }

        @Override
        public Object getCellEditorValue() { return ""; }
    }

    private class StatusRenderer extends JLabel implements TableCellRenderer {
        StatusRenderer() {
            setOpaque(true);
            setBorder(BorderFactory.createCompoundBorder(
                    BorderFactory.createLineBorder(Color.GRAY, 1),
                    BorderFactory.createEmptyBorder(2, 6, 2, 6)
            ));
            setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        }

        @Override
        public Component getTableCellRendererComponent(
                JTable table, Object value, boolean isSelected, boolean hasFocus, int row, int column) {
            setText(value != null ? "✎ " + value : "");
            setBackground(new Color(255, 255, 200));
            setForeground(new Color(100, 80, 0));
            setFont(getFont().deriveFont(Font.BOLD, 11f));
            return this;
        }
    }

    private static String formatDate(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val == null) return "";
        String s = val.toString();
        return s.replace("T", " ").substring(0, Math.min(16, s.length()));
    }

    private static int getInt(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val == null) return 0;

        if (val instanceof Number n) {
            return n.intValue();
        }

        try {
            return (int) Double.parseDouble(val.toString());
        } catch (Exception e) {
            return 0;
        }
    }

    private class MultiLineRenderer extends JTextArea implements TableCellRenderer {

        public MultiLineRenderer() {
            setLineWrap(true);
            setWrapStyleWord(true);
            setOpaque(true);
        }

        @Override
        public Component getTableCellRendererComponent(
                JTable table,
                Object value,
                boolean isSelected,
                boolean hasFocus,
                int row,
                int column) {

            setText(value == null ? "" : value.toString());

            if (isSelected) {
                setBackground(table.getSelectionBackground());
                setForeground(table.getSelectionForeground());
            } else {
                setBackground(Color.WHITE);
                setForeground(Color.BLACK);
            }

            int lines = getText().split("\n").length;
            table.setRowHeight(row, Math.max(40, lines * 18));

            return this;
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new Main().setVisible(true));
    }
}