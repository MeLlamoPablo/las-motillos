variable "aws_dynamodb_endpoint" {
  default = ""
}

variable "aws_iam_endpoint" {
  default = null
}

variable "aws_sts_endpoint" {
  default = ""
}

variable "vercel_api_token" {
  default = ""
}

output "alexa_client_secret" {
  description = "Alexa must authenticate with this secret when calling /api/access-token"
  value = random_password.alexa_client_secret.result
  sensitive = true
}
