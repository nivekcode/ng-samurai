<% if (generateModule) { %>export * from './<%= dasherize(name) %>.module';<% } %>
<% if (generateComponent) { %>export * from './<%= dasherize(name) %>.component';<% } %>
