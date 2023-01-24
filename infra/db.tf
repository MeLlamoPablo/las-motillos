resource "aws_dynamodb_table" "auth_codes" {
  name           = "auth_codes"
  billing_mode   = "PROVISIONED"
  read_capacity  = 2
  write_capacity = 2
  hash_key       = "code"

  attribute {
    name = "code"
    type = "S"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }
}
