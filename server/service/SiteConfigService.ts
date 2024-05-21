import SiteConfig from '@/server/models/SiteConfig';
import BaseService from '@/server/base/BaseService';
import { CreationAttributes, Op, Order } from 'sequelize';

export default class SiteConfigService extends BaseService<SiteConfig> {
    constructor() {
        super(SiteConfig);
    }

    async selectPage(query: SiteConfigQuery): Promise<BasePageResponse<SiteConfig>> {
        return this.page(query);
    }

    async createSiteConfig(configData: CreationAttributes<SiteConfig>): Promise<SiteConfig> {
        return await defineTransactionWrapper(async (transaction) => {
            return await this.create(configData, { transaction });
        });
    }

    async updateSiteConfig(configId: number, configData: Partial<CreationAttributes<SiteConfig>>): Promise<void> {
        await defineTransactionWrapper(async (transaction) => {
            await this.update(configData, { where: { id: configId }, transaction });
        });
    }

    async deleteSiteConfig(configIds: number[]): Promise<void> {
        await defineTransactionWrapper(async (transaction) => {
            await this.delete({ where: { id: configIds }, transaction });
        });
    }

    async getSiteConfigById(configId: number | string): Promise<SiteConfig | null> {
        return await SiteConfig.findByPk(configId);
    }

    async getAllSiteConfigs(key?: string, asc: boolean = true): Promise<SiteConfig[]> {
        const whereClause = key ? { key: { [Op.like]: `%${key}%` } } : {};

        const orderClause: Order = [['sort', asc ? 'ASC' : 'DESC']];

        // 构建查询条件
        const options = {
            where: whereClause,
            order: orderClause
        };

        return await SiteConfig.findAll(options);
    }
}
