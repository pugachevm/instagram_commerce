let method = require('./method'),
    fs = require('fs'),
    Client = require('instagram-private-api').V1,
    updateFollower = require('./updateFollower'),
    querystring = require('querystring'),
    _wa = JSON.parse(fs.readFileSync('./src/workarounds.json', 'utf-8'));


const FETCH_FILENAME = [ __dirname, '.fetch.timestamp' ].join('/');
const CURSOR_FILENAME = [ __dirname, '.fetch.token' ].join('/');
const UPDATE_TIMEOUT = (3600 * 24 * 0.5 * 1000);

module.exports = function(models) {
    return method(models, fetchFollowers)
};

function fetchFollowers(followUp) {
    let models = this,
        InstagramFollowers = models.InstagramFollowers,
        { $username, $password } = _wa,
        device = new Client.Device($username),
        storage = new Client.CookieFileStorage(__dirname + '/cookies/'+ $username +'.json');


    if(new Date() < new Date(+fs.readFileSync(FETCH_FILENAME, 'utf-8'))) {
        return
    }

    return Client.Session.create(device, storage, $username, $password)
        .then(function(session) {
            let { $query_hash, $id } = _wa,
                update = updateFollower.bind(models);
            
            fs.writeFileSync(FETCH_FILENAME, +(new Date()) + UPDATE_TIMEOUT);

            let after = fs.readFileSync(CURSOR_FILENAME, 'utf-8');

            return loadInstagramFollowers.call({ session, update }, $query_hash, $id, 20, after, followUp)
        })
        .catch(console.error)
}

function loadInstagramFollowers(query_hash, id, first=20, after=null, followUp=true) {
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

            let { data, status } = body;console.log('status: %o', status);

            if(status != 'ok') {
                return
            }

            let { user } = data,
                { count, edges, page_info } = user.edge_followed_by,
                { has_next_page, end_cursor } = page_info;
            
            if(!followUp) {
                return edges
            }
            
            if(!has_next_page) {
                return
            }
            
            after = has_next_page ? end_cursor : null;

            fs.writeFileSync(CURSOR_FILENAME, after);// update cursor to continue on aborting

            edges.forEach((node, i) => {
                let user = node.node;
                
                update({
                    instagramId: user.id,
                    instagramNickname: user.username
                })
            })

            return !!after
                ? loadInstagramFollowers.call(_this, query_hash, id, first, after)
                : false
        })
        .catch(console.error)
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