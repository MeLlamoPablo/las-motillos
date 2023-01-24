resource "random_password" "alexa_client_secret" {
  length = 64
  special = false # Alexa doesn't like special characters in their client secrets
}

resource "shell_script" "alexa_client_secret_hashed" {
  //noinspection HCLUnknownBlockType
  lifecycle_commands {
    create = <<EOF
      SALT="$(openssl rand -hex 16)"
      HASH="$(echo "$SECRET" | tr -d '\n' | argon2 "$SALT" -e)"
      echo "{ \"hash\": \"$HASH\" }"
    EOF
    delete = "exit 0"
  }

  sensitive_environment = {
    SECRET = random_password.alexa_client_secret.result
  }
}
