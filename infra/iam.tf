resource "aws_iam_user" "auth_api" {
  name = "auth-api"
  path = "/las-motillos/"
}

resource "aws_iam_access_key" "auth_api" {
  user = aws_iam_user.auth_api.name
}

data "aws_iam_policy_document" "auth_api" {
  version = "2012-10-17"

  statement {
    sid    = "DbAccess"
    effect = "Allow"

    actions = [
      "dynamodb:DeleteItem",
      "dynamodb:GetItem",
      "dynamodb:PutItem",
    ]

    resources = [
      aws_dynamodb_table.auth_codes.arn,
    ]
  }
}

resource "aws_iam_user_policy" "auth_api" {
  name   = "auth-api-db-access"
  user   = aws_iam_user.auth_api.name
  policy = data.aws_iam_policy_document.auth_api.json
}
