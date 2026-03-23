package com.learningplatform.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {

    private Security security = new Security();
    private Teams teams = new Teams();

    @Data
    public static class Security {
        private String jwtSecret;
        private long jwtExpirationMs = 86400000L;
    }

    @Data
    public static class Teams {
        private String defaultWebhookUrl;
        private int connectTimeoutSeconds = 10;
        private int readTimeoutSeconds = 15;
    }

}
