---
title: Kage Class
description: The main application class for creating Kage servers
---

The main application class for creating Kage servers.

## Constructor

```ts
new Kage();
```

Creates a new Kage application instance.

## Routing Methods

### .get(path, handler)

Register a GET route handler.

### .post(path, handler)

Register a POST route handler.

### .put(path, handler)

Register a PUT route handler.

### .patch(path, handler)

Register a PATCH route handler.

### .delete(path, handler)

Register a DELETE route handler.

## Middleware Methods

### .use(middleware)

Add middleware function or plugin.

### .mount(prefix, router)

Mount a router at a URL prefix.

## Extension Methods

### .decorate(key, value)

Add a property to the context object.

### .derive(fn)

Compute derived values for each request.

### .state(key, value)

Define shared state accessible via ctx.store.

## Lifecycle Hooks

### .onRequest(fn)

Called when a request is received.

### .onResponse(fn)

Called before sending the response.

### .onAfterHandle(fn)

Called after the handler completes.

## Server Methods

### .listen(port, callback?)

Start the HTTP server on the specified port.

### .fetch(request)

Handle a request directly (useful for testing).
