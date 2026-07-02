package com.meladen.config;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;
import javax.sql.DataSource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/** Ensures newer product columns exist when Hibernate ddl-auto did not run (e.g. production). */
@Component
@RequiredArgsConstructor
@Slf4j
public class ProductSchemaPatcher implements ApplicationRunner {

  private final DataSource dataSource;

  @Override
  public void run(ApplicationArguments args) throws Exception {
    ensureColumn("products", "price_body_hair_mist", "DECIMAL(12,2) NULL");
  }

  private void ensureColumn(String table, String column, String sqlType) throws Exception {
    try (Connection conn = dataSource.getConnection()) {
      DatabaseMetaData meta = conn.getMetaData();
      String catalog = conn.getCatalog();
      try (ResultSet rs = meta.getColumns(catalog, null, table, column)) {
        if (rs.next()) {
          return;
        }
      }
      String ddl = "ALTER TABLE " + table + " ADD COLUMN " + column + " " + sqlType;
      try (Statement st = conn.createStatement()) {
        st.execute(ddl);
        log.info("Schema patch applied: {}", ddl);
      }
    }
  }
}
