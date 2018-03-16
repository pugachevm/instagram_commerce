let method = require('./method'),
    fs = require('fs'),
    Client = require('instagram-private-api').V1,
    updateFollower = require('./updateFollower'),
    querystring = require('querystring'),
    _wa = JSON.parse(fs.readFileSync('./src/workarounds.json', 'utf-8'));


const FETCH_FILENAME = [ __dirname, 'fetch.timestamp' ].join('/');
const CURSOR_FILENAME = [ __dirname, 'fetch.token' ].join('/');
const UPDATE_TIMEOUT = (3600 * 24 * (1/24) * 1000);

module.exports = function(models) {
    return method(models, fetchFollowers)
};

function fetchFollowers(followUp=true, after=null) {
    let models = this,
        InstagramFollowers = models.InstagramFollowers,
        $username = !!followUp ? _wa.$username : _wa.$strangername,
        $password = _wa.$password,
        device = new Client.Device($username),
        storage = new Client.CookieFileStorage(__dirname + '/cookies/'+ $username +'.json'),
        update = updateFollower(models);


    /*if(new Date() < new Date(+fs.readFileSync(FETCH_FILENAME, 'utf-8'))) {
        return
    }*/

    return Client.Session.create(device, storage, $username, $password)
        .then(function(session) {
            let { $query_hash, $id } = _wa,
                count = 5000;

            if(!followUp && !!after) {
                return loadInstagramFollowers.call({ session, update }, $query_hash, $id, count, after, false)
            }
            
            fs.writeFileSync(FETCH_FILENAME, +(new Date()));

            try { after = fs.readFileSync(CURSOR_FILENAME, 'utf-8') } catch(e) { console.error(e) }
            after = !!after ? after : null;

            console.log('Fetching started from: %o', after);

            return loadInstagramFollowers.call({ session, update }, $query_hash, $id, count, after, followUp)
        })
        .catch(console.error)
}

function loadInstagramFollowers(query_hash, id, first=5000, after=null, followUp=true) {
    let _this = this,
        { session, update } = this;

    return new Client.Web.Request(session)
        .setMethod('GET')
        .setGraphQlResource(query_hash, { id, first, after })
        .generateUUID()
        .signPayload()
        .send()
        .then(res => {
            let { body, headers } = res;

            if(!!body == false) {
                return
            }

            body = JSON.parse(body);

            let { data, status } = body;

            console.log('\x1b[33m%s\x1b[0m %o', 'status:', status);

            if(status != 'ok') {
                return
            }

            let { user } = data,
                { count, edges, page_info } = user.edge_followed_by,
                { has_next_page, end_cursor } = page_info;

            console.log('next_page: %o', has_next_page);

            after = !!has_next_page ? end_cursor : '';

            fs.writeFileSync(CURSOR_FILENAME, after);// update cursor to continue on aborting

            if(!followUp) {
                return edges
            }

            edges.forEach((node, i) => {
                let user = node.node;

                if(!!user && !!user.id && !!user.username) {
                    update({
                        instagramId: user.id,
                        instagramNickname: user.username,
                        cursor: after
                    })
                        .catch(e => {});//console.error('\x1b[31m%s\x1b[0m', e))
                }
            });

            return !!after
                ? loadInstagramFollowers.call(_this, query_hash, id, first, after)
                : false
        })
        .catch(res => {
            let { body, headers } = res;

            if(!!body == false) {
                return false
            }

            body = JSON.parse(body);

            let { message, status } = body;

            console.log('\x1b[31m%s\x1b[0m %o', 'message', message);
            console.log('\x1b[33m%s\x1b[0m %o', 'status:', status);

            return false
        })
}

Client.Web.Request.prototype.setGraphQlResource = function(query_hash, variables) {
    let _replacements = {
        $qh: query_hash,
        $v: querystring.escape(JSON.stringify(variables))
    };
    let _gql = 'graphql/query/?query_hash=$qh&variables=$v'.replace(/\$qh|\$v/ig, function(key) { return _replacements[key] });
    this._resource = _gql;
    this.setUrl(Client.CONSTANTS.WEBHOST + _gql);
    return this;
};