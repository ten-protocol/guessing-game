// @ts-ignore
module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {app_developer} = await getNamedAccounts();

    const token = await deploy('ERC20', {
        from: app_developer,
        args: [],
        log: true,
    });

    await deploy('Guess', {
        from: app_developer,
        args: [100, token.address],
        log: true,
    });
};
module.exports.tags = ['ERC20', 'Guess'];