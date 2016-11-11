expect = require('indeed').expect
fs = require('fs')

describe 'marky-mark', ->

  Given -> @mm = require '../marky-mark.js'

  describe '.parseDirectorySync', ->
    When -> @posts = @mm.parseDirectorySync __dirname + '/posts'
    Then -> expect(@posts[0]).to.deep.equal
      filename: "post1"
      filenameExtension: ".md"
      yaml: "date: 2012-01-01\ncategory: test\ntitle: post 1"
      markdown: "This is a test post. The first one."
      content: "<p>This is a test post. The first one.</p>"
      meta:
        date: new Date('2012-01-01T00:00:00.000Z')
        category: "test"
        title: "post 1"
    And -> expect(@posts[1]).to.deep.equal
      filename: "post2"
      filenameExtension: ".md"
      yaml: "category: test\ntags:\n- tag 1\n- tag 2\n- tag 3\ntitle: post 2"
      markdown: "This is the second test post. it has more space between the content and front matter. \n\n## h2"
      content: "<p>This is the second test post. it has more space between the content and front matter. </p>\n<h2 id=\"h2\">h2</h2>"
      meta:
        category: "test"
        tags: [
          "tag 1"
          "tag 2"
          "tag 3"
        ],
        title: "post 2"
    And -> expect(@posts[2]).to.deep.equal
      filename: "table"
      filenameExtension: ".md"
      yaml: ""
      markdown: "# Markdown with a table\n\n| Heading | Heading 2 | Heading 3|\n|---------|-----------|----------|\n| foo     | bar       | baz      |"
      content: '<h1 id="markdown-with-a-table">Markdown with a table</h1>\n<table>\n<thead>\n<tr>\n<th>Heading</th>\n<th>Heading 2</th>\n<th>Heading 3</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>foo</td>\n<td>bar</td>\n<td>baz</td>\n</tr>\n</tbody>\n</table>'
      meta: {}

  describe '.parseMatchesSync', ->
    When -> @posts = @mm.parseMatchesSync __dirname + '/posts', '**1.md'
    Then -> expect(@posts).to.deep.equal [
      filename: "post1"
      filenameExtension: ".md"
      yaml: "date: 2012-01-01\ncategory: test\ntitle: post 1"
      markdown: "This is a test post. The first one."
      content: "<p>This is a test post. The first one.</p>"
      meta:
        date: new Date('2012-01-01T00:00:00.000Z')
        category: "test"
        title: "post 1"
    ]

  describe '.parseFileSync', ->
    When -> @posts = @mm.parseFileSync __dirname + '/posts/post1.md'
    Then -> expect(@posts).to.deep.equal
      filename: "post1"
      filenameExtension: ".md"
      yaml: "date: 2012-01-01\ncategory: test\ntitle: post 1"
      markdown: "This is a test post. The first one."
      content: "<p>This is a test post. The first one.</p>"
      meta:
        date: new Date('2012-01-01T00:00:00.000Z')
        category: "test"
        title: "post 1"

  describe '.parseFilesSync', ->
    When -> @posts = @mm.parseFilesSync [__dirname + '/posts/post1.md', __dirname + '/posts/post2.md']
    Then -> expect(@posts[0]).to.deep.equal
      filename: "post1"
      filenameExtension: ".md"
      yaml: "date: 2012-01-01\ncategory: test\ntitle: post 1"
      markdown: "This is a test post. The first one."
      content: "<p>This is a test post. The first one.</p>"
      meta:
        date: new Date('2012-01-01T00:00:00.000Z')
        category: "test"
        title: "post 1"
    And -> expect(@posts[1]).to.deep.equal
      filename: "post2"
      filenameExtension: ".md"
      yaml: "category: test\ntags:\n- tag 1\n- tag 2\n- tag 3\ntitle: post 2"
      markdown: "This is the second test post. it has more space between the content and front matter. \n\n## h2"
      content: "<p>This is the second test post. it has more space between the content and front matter. </p>\n<h2 id=\"h2\">h2</h2>"
      meta:
        category: "test"
        tags: [
          "tag 1"
          "tag 2"
          "tag 3"
        ],
        title: "post 2"

  describe '.parse', ->
    Given -> @md = fs.readFileSync __dirname + '/posts/post1.md', 'utf8'

    context 'with a filename', ->
      When -> @context = @mm.parse @md, 'banana'
      Then -> expect(@context).to.deep.equal
        filename: "banana"
        filenameExtension: ".md"
        yaml: "date: 2012-01-01\ncategory: test\ntitle: post 1"
        markdown: "This is a test post. The first one."
        content: "<p>This is a test post. The first one.</p>"
        meta:
          date: new Date('2012-01-01T00:00:00.000Z')
          category: "test"
          title: "post 1"

    context 'without a filename', ->
      When -> @context = @mm.parse @md
      Then -> expect(@context).to.deep.equal
        filenameExtension: ".md"
        yaml: "date: 2012-01-01\ncategory: test\ntitle: post 1"
        markdown: "This is a test post. The first one."
        content: "<p>This is a test post. The first one.</p>"
        meta:
          date: new Date('2012-01-01T00:00:00.000Z')
          category: "test"
          title: "post 1"

    context 'with preCompile', ->
      Given -> @options =
        preCompile: (md) -> return md.replace('post', 'pilot')
      When -> @context = @mm.parse @md, @options
      Then -> expect(@context).to.deep.equal
        filenameExtension: ".md"
        yaml: "date: 2012-01-01\ncategory: test\ntitle: post 1"
        markdown: "This is a test pilot. The first one."
        content: "<p>This is a test pilot. The first one.</p>"
        meta:
          date: new Date('2012-01-01T00:00:00.000Z')
          category: "test"
          title: "post 1"

    context 'with postCompile', ->
      Given -> @options =
        postCompile: (html) -> return html.replace('post', 'pilot')
      When -> @context = @mm.parse @md, 'banana', @options
      Then -> expect(@context).to.deep.equal
        filename: "banana"
        filenameExtension: ".md"
        yaml: "date: 2012-01-01\ncategory: test\ntitle: post 1"
        markdown: "This is a test post. The first one."
        content: "<p>This is a test pilot. The first one.</p>"
        meta:
          date: new Date('2012-01-01T00:00:00.000Z')
          category: "test"
          title: "post 1"

    context 'with additional context', ->
      Given -> @options =
        context:
          foo: 'bar'
      When -> @context = @mm.parse @md, 'banana', @options
      Then -> expect(@context).to.deep.equal
        filename: "banana"
        filenameExtension: ".md"
        yaml: "date: 2012-01-01\ncategory: test\ntitle: post 1"
        markdown: "This is a test post. The first one."
        content: "<p>This is a test post. The first one.</p>"
        meta:
          date: new Date('2012-01-01T00:00:00.000Z')
          category: "test"
          title: "post 1"
          foo: 'bar'

    context 'with options for marked', ->
      Given -> @md = fs.readFileSync __dirname + '/posts/table.md', 'utf8'
      Given -> @options =
        marked:
          tables: false
      When -> @context = @mm.parse @md, @options
      Then -> expect(@context).to.deep.equal
        filenameExtension: ".md"
        yaml: ""
        markdown: "# Markdown with a table\n\n| Heading | Heading 2 | Heading 3|\n|---------|-----------|----------|\n| foo     | bar       | baz      |"
        content: '<h1 id="markdown-with-a-table">Markdown with a table</h1>\n<p>| Heading | Heading 2 | Heading 3|\n|---------|-----------|----------|\n| foo     | bar       | baz      |</p>'
        meta: {}

  describe '.parseDirectory', ->
    When (done) -> @mm.parseDirectory __dirname + '/posts', (err, @posts) => done()
    Then -> expect(@posts[0]).to.deep.equal
      filename: "post1"
      filenameExtension: ".md"
      yaml: "date: 2012-01-01\ncategory: test\ntitle: post 1"
      markdown: "This is a test post. The first one."
      content: "<p>This is a test post. The first one.</p>"
      meta:
        date: new Date('2012-01-01T00:00:00.000Z')
        category: "test"
        title: "post 1"
    And -> expect(@posts[1]).to.deep.equal
      filename: "post2"
      filenameExtension: ".md"
      yaml: "category: test\ntags:\n- tag 1\n- tag 2\n- tag 3\ntitle: post 2"
      markdown: "This is the second test post. it has more space between the content and front matter. \n\n## h2"
      content: "<p>This is the second test post. it has more space between the content and front matter. </p>\n<h2 id=\"h2\">h2</h2>"
      meta:
        category: "test"
        tags: [
          "tag 1"
          "tag 2"
          "tag 3"
        ],
        title: "post 2"
    And -> expect(@posts[2]).to.deep.equal
      filename: "table"
      filenameExtension: ".md"
      yaml: ""
      markdown: "# Markdown with a table\n\n| Heading | Heading 2 | Heading 3|\n|---------|-----------|----------|\n| foo     | bar       | baz      |"
      content: '<h1 id="markdown-with-a-table">Markdown with a table</h1>\n<table>\n<thead>\n<tr>\n<th>Heading</th>\n<th>Heading 2</th>\n<th>Heading 3</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>foo</td>\n<td>bar</td>\n<td>baz</td>\n</tr>\n</tbody>\n</table>'
      meta: {}

  describe '.parseMatches', ->
    When (done) -> @mm.parseMatches __dirname + '/posts', '**1.md', (err, @posts) => done()
    Then -> expect(@posts).to.deep.equal [
      filename: "post1"
      filenameExtension: ".md"
      yaml: "date: 2012-01-01\ncategory: test\ntitle: post 1"
      markdown: "This is a test post. The first one."
      content: "<p>This is a test post. The first one.</p>"
      meta:
        date: new Date('2012-01-01T00:00:00.000Z')
        category: "test"
        title: "post 1"
    ]

  describe '.parseFile', ->
    When (done) -> @mm.parseFile __dirname + '/posts/post1.md', (err, @posts) => done()
    Then -> expect(@posts).to.deep.equal
      filename: "post1"
      filenameExtension: ".md"
      yaml: "date: 2012-01-01\ncategory: test\ntitle: post 1"
      markdown: "This is a test post. The first one."
      content: "<p>This is a test post. The first one.</p>"
      meta:
        date: new Date('2012-01-01T00:00:00.000Z')
        category: "test"
        title: "post 1"

  describe '.parseFiles', ->
    When (done) -> @mm.parseFiles [__dirname + '/posts/post1.md', __dirname + '/posts/post2.md'], (err, @posts) => done()
    Then -> expect(@posts[0]).to.deep.equal
      filename: "post1"
      filenameExtension: ".md"
      yaml: "date: 2012-01-01\ncategory: test\ntitle: post 1"
      markdown: "This is a test post. The first one."
      content: "<p>This is a test post. The first one.</p>"
      meta:
        date: new Date('2012-01-01T00:00:00.000Z')
        category: "test"
        title: "post 1"
    And -> expect(@posts[1]).to.deep.equal
      filename: "post2"
      filenameExtension: ".md"
      yaml: "category: test\ntags:\n- tag 1\n- tag 2\n- tag 3\ntitle: post 2"
      markdown: "This is the second test post. it has more space between the content and front matter. \n\n## h2"
      content: "<p>This is the second test post. it has more space between the content and front matter. </p>\n<h2 id=\"h2\">h2</h2>"
      meta:
        category: "test"
        tags: [
          "tag 1"
          "tag 2"
          "tag 3"
        ],
        title: "post 2"
