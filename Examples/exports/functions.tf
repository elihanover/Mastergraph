

data "archive_file" "myprecious_zip" {
  type        = "zip"
  source_file = "myprecious.js"
  output_path = "myprecious.zip"
}


data "archive_file" "schmeeeegle_zip" {
  type        = "zip"
  source_file = "schmeeeegle.js"
  output_path = "schmeeeegle.zip"
}


resource "aws_iam_role" "iam_for_myprecious" {
  name               = "iam_for_myprecious"
  assume_role_policy = "${data.aws_iam_policy_document.policy.json}"
}


resource "aws_iam_role" "iam_for_schmeeeegle" {
  name               = "iam_for_schmeeeegle"
  assume_role_policy = "${data.aws_iam_policy_document.policy.json}"
}


resource "aws_lambda_function" "myprecious" {
  function_name    = "myprecious"
  role             = "${aws_iam_role.iam_for_myprecious.arn}"
  handler          = "myprecious.handler"
  runtime          = "nodejs6.10"
  filename         = "${data.archive_file.myprecious_zip.output_path}"
  source_code_hash = "${data.archive_file.myprecious_zip.output_sha}"
}


resource "aws_lambda_function" "schmeeeegle" {
  function_name    = "schmeeeegle"
  role             = "${aws_iam_role.iam_for_schmeeeegle.arn}"
  handler          = "schmeeeegle.handler"
  runtime          = "nodejs6.10"
  filename         = "${data.archive_file.schmeeeegle_zip.output_path}"
  source_code_hash = "${data.archive_file.schmeeeegle_zip.output_sha}"
}


resource "aws_api_gateway_rest_api" "api_gateway" {
  name        = "AWS_API_Gateway"
  description = "AWS API Gateway"
}


resource "aws_api_gateway_resource" "myprecious" {
  rest_api_id = "${aws_api_gateway_rest_api.api_gateway.id}"
  parent_id   = "${aws_api_gateway_rest_api.api_gateway.root_resource_id}"
  path_part   = "heythere"
}


resource "aws_api_gateway_resource" "schmeeeegle" {
  rest_api_id = "${aws_api_gateway_rest_api.api_gateway.id}"
  parent_id   = "${aws_api_gateway_rest_api.api_gateway.root_resource_id}"
  path_part   = "master"
}


resource "aws_api_gateway_method" "myprecious" {
  rest_api_id   = "${aws_api_gateway_rest_api.api_gateway.id}"
  resource_id   = "${aws_api_gateway_resource.myprecious.id}"
  http_method   = "GET"
  authorization = "NONE"
}


resource "aws_api_gateway_method" "schmeeeegle" {
  rest_api_id   = "${aws_api_gateway_rest_api.api_gateway.id}"
  resource_id   = "${aws_api_gateway_resource.schmeeeegle.id}"
  http_method   = "GET"
  authorization = "NONE"
}


resource "aws_api_gateway_integration" "myprecious" {
  rest_api_id             = "${aws_api_gateway_rest_api.api_gateway.id}"
  resource_id             = "${aws_api_gateway_method.myprecious.resource_id}"
  http_method             = "${aws_api_gateway_method.myprecious.http_method}"
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.myprecious.invoke_arn}"
}


resource "aws_api_gateway_integration" "schmeeeegle" {
  rest_api_id             = "${aws_api_gateway_rest_api.api_gateway.id}"
  resource_id             = "${aws_api_gateway_method.schmeeeegle.resource_id}"
  http_method             = "${aws_api_gateway_method.schmeeeegle.http_method}"
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.schmeeeegle.invoke_arn}"
}


resource "aws_api_gateway_deployment" "myprecious_aws_api_gateway_deployment" {
  depends_on  = ["aws_api_gateway_integration.myprecious"]
  rest_api_id = "${aws_api_gateway_rest_api.api_gateway.id}"
  stage_name  = "hello"
}


resource "aws_api_gateway_deployment" "schmeeeegle_aws_api_gateway_deployment" {
  depends_on  = ["aws_api_gateway_integration.schmeeeegle"]
  rest_api_id = "${aws_api_gateway_rest_api.api_gateway.id}"
  stage_name  = "hello"
}


resource "aws_lambda_permission" "myprecious_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.myprecious.arn}"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_deployment.myprecious_aws_api_gateway_deployment.execution_arn}/*/*"
}


resource "aws_lambda_permission" "schmeeeegle_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.schmeeeegle.arn}"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_deployment.schmeeeegle_aws_api_gateway_deployment.execution_arn}/*/*"
}



