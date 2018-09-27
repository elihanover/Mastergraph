

data "archive_file" "zip" {
  type        = "zip"
  source_file = "myprecious.js"
  output_path = "myprecious.zip"
}


resource "aws_iam_role" "iam_for_myprecious" {
  name               = "iam_for_myprecious"
  assume_role_policy = "${data.aws_iam_policy_document.policy.json}"
}


resource "aws_lambda_function" "myprecious" {
  function_name    = "myprecious"
  role             = "${aws_iam_role.iam_for_myprecious.arn}"
  handler          = "myprecious.handler"
  runtime          = "nodejs6.10"
  filename         = "${data.archive_file.zip.output_path}"
  source_code_hash = "${data.archive_file.zip.output_sha}"
}


resource "aws_api_gateway_rest_api" "api_gateway" {
  name        = "AWS_API_Gateway"
  description = "AWS API Gateway"
}


resource "aws_api_gateway_resource" "myprecious" {
  rest_api_id = "${aws_api_gateway_rest_api.api_gateway.id}"
  parent_id   = "${aws_api_gateway_rest_api.api_gateway.root_resource_id}"
  path_part   = "myprecious.heythere"
}


resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = "${aws_api_gateway_rest_api.api_gateway.id}"
  parent_id   = "${aws_api_gateway_rest_api.api_gateway.root_resource_id}"
  path_part   = "{proxy+}"
}


resource "aws_api_gateway_method" "myprecious" {
  rest_api_id   = "${aws_api_gateway_rest_api.api_gateway.id}"
  resource_id   = "${aws_api_gateway_resource.myprecious.id}"
  http_method   = "GET"
  authorization = "NONE"
}


resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = "${aws_api_gateway_rest_api.api_gateway.id}"
  resource_id   = "${aws_api_gateway_resource.proxy.id}"
  http_method   = "ANY"
  authorization = "NONE"
}


resource "aws_api_gateway_integration" "myprecious" {
  rest_api_id             = "${aws_api_gateway_rest_api.api_gateway.id}"
  resource_id             = "${aws_api_gateway_method.proxy.resource_id}"
  http_method             = "${aws_api_gateway_method.proxy.http_method}"
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.myprecious.invoke_arn}"
}


resource "aws_api_gateway_integration" "lambda_root" {
  rest_api_id             = "${aws_api_gateway_rest_api.api_gateway.id}"
  resource_id             = "${aws_api_gateway_method.myprecious.resource_id}"
  http_method             = "${aws_api_gateway_method.myprecious.http_method}"
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.myprecious.invoke_arn}"
}


resource "aws_api_gateway_deployment" "aws_api_gateway_deployment" {
  depends_on  = ["aws_api_gateway_integration.myprecious", "aws_api_gateway_integration.lambda_root"]
  rest_api_id = "${aws_api_gateway_rest_api.api_gateway.id}"
  stage_name  = "hello"
}


resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.myprecious.arn}"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_deployment.aws_api_gateway_deployment.execution_arn}/*/*"
}


output "base_url" {
  value = "${aws_api_gateway_deployment.aws_api_gateway_deployment.invoke_url}"
}


