import ux from 'cli-ux';
import { HTTPError } from 'http-call';

function httpErrorToErrorTree(error: HTTPError) {
  const http = error.http;
  const errorTree = ux.tree();

  if (http && http.body && http.body.errors) {
    const errors: { [index: string]: string[] } = http.body.errors;
    Object.keys(errors).forEach(identifier => {
      errorTree.insert(identifier);
      errors[identifier].forEach(error =>
        errorTree.nodes[identifier].insert(error)
      );
    });
  }

  return errorTree;
}

export function handleHttpError(error: unknown) {
  if ((error as any)?.http?.body?.errors) {
    const errorTree = httpErrorToErrorTree(error as HTTPError);
    errorTree.display();
  } else if ((error as any)?.http?.body) {
    throw new Error((error as any).http.body.error);
  } else {
    throw error;
  }
}
