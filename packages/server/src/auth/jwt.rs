//! JWT Token 处理模块

use anyhow::Result;
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

/// JWT 配置
pub struct JwtConfig {
    /// 密钥
    pub secret: String,
    
    /// 过期时间（小时）
    pub expiration_hours: i64,
}

impl Default for JwtConfig {
    fn default() -> Self {
        Self {
            secret: String::from("your-secret-key-change-in-production"),
            expiration_hours: 24 * 7, // 7 天
        }
    }
}

/// JWT Claims
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    /// 用户 ID
    pub sub: String,
    
    /// 过期时间
    pub exp: i64,
    
    /// 签发时间
    pub iat: i64,
}

/// 生成 JWT Token
/// 
/// # 参数
/// - `user_id`: 用户 ID
/// - `config`: JWT 配置
/// 
/// # 返回
/// JWT Token 字符串
pub fn generate_token(user_id: &str, config: &JwtConfig) -> Result<String> {
    let now = Utc::now();
    let exp = now + Duration::hours(config.expiration_hours);
    
    let claims = Claims {
        sub: user_id.to_string(),
        exp: exp.timestamp(),
        iat: now.timestamp(),
    };
    
    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(config.secret.as_bytes()),
    )?;
    
    Ok(token)
}

/// 验证 JWT Token
/// 
/// # 参数
/// - `token`: JWT Token
/// - `config`: JWT 配置
/// 
/// # 返回
/// 验证成功返回 Claims
pub fn verify_token(token: &str, config: &JwtConfig) -> Result<Claims> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(config.secret.as_bytes()),
        &Validation::default(),
    )?;
    
    Ok(token_data.claims)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_and_verify_token() {
        let config = JwtConfig::default();
        let user_id = "test-user-id";
        
        let token = generate_token(user_id, &config).unwrap();
        let claims = verify_token(&token, &config).unwrap();
        
        assert_eq!(claims.sub, user_id);
    }
}