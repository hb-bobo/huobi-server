


// 买卖交易金额
exports.ORDERS_HISTORY = `
    CREATE TABLE IF NOT EXISTS ORDERS_HISTORY(
        id INT UNSIGNED AUTO_INCREMENT,
        symbol VARCHAR(10) NOT NULL,
        order_id LONG,
        order_amount FLOAT NOT NULL,
        order_price FLOAT NOT NULL,
        order-state VARCHAR(10),
        order-type VARCHAR(10),
        role
        price
        filled-amount
        unfilled-amount
        filled-fees
        filled-cash-amount
        created_at DATETIME,
        PRIMARY KEY ( id )
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;
`;