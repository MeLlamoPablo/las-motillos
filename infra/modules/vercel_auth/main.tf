terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.4"
    }
  }
}

variable "vercel_api_token" {}
variable "aws_access_key_id" {}
variable "aws_secret_access_key" {}
variable "alexa_client_secret_hash" {}

data "vercel_project" "login" {
  name = "las-motillos-acciona-login"
}

resource "vercel_project_environment_variable" "aws_access_key_id" {
  project_id = data.vercel_project.login.id
  key        = "API_AWS_ACCESS_KEY_ID"
  value      = var.aws_access_key_id
  target     = ["production"]
}

resource "vercel_project_environment_variable" "aws_secret_access_key" {
  project_id = data.vercel_project.login.id
  key        = "API_AWS_SECRET_ACCESS_KEY"
  value      = var.aws_secret_access_key
  target     = ["production"]
}

resource "vercel_project_environment_variable" "alexa_client_secret" {
  project_id = data.vercel_project.login.id
  key        = "ALEXA_CLIENT_SECRET"
  value      = var.alexa_client_secret_hash
  target     = ["production"]
}
